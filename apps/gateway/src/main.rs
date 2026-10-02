use hyper_util::{client::legacy::Client, rt::TokioExecutor};
use std::{net::SocketAddr, sync::Arc};
use tokio::{signal, sync::RwLock};
use zelefy_backend::{
    api::logs::{build_trace_layer, init_tracing},
    cache::init_cache,
};

use zelefy_gateway::{
    AppState,
    config::Config,
    routes::{
        discovery::discover_all,
        registry::{RouteRegistry, SharedRegistry},
        routes,
    },
};

#[tokio::main]
async fn main() {
    init_tracing();

    let config = Config::from_env().expect("Config error");
    let cache_manager = init_cache(&config.cache_url)
        .await
        .expect("Failed to initialize cache connection");

    let http_client = Client::builder(TokioExecutor::new())
        .pool_max_idle_per_host(100)
        .build_http();

    let registry: SharedRegistry = Arc::new(RwLock::new(RouteRegistry::default()));

    let state = AppState {
        cache: cache_manager,
        config: config.clone(),
        http_client,
        registry: registry.clone(),
    };

    discover_all(&state.http_client, registry.clone(), &config).await;

    {
        let http_client = state.http_client.clone();
        let registry = registry.clone();
        let config = config.clone();
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(std::time::Duration::from_secs(30));
            loop {
                interval.tick().await;
                discover_all(&http_client, registry.clone(), &config).await;
            }
        });
    }

    let app = routes(state).layer(build_trace_layer());

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("API Gateway running on {}", config.url);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("Shutdown signal received, starting graceful shutdown...");
}
