use hyper_util::{client::legacy::Client, rt::TokioExecutor};
use std::net::SocketAddr;
use tokio::signal;
use zelefy_backend::{
    api::logs::{build_trace_layer, init_tracing},
    cache::init_redis,
};

use zelefy_gateway::{AppState, config::Config, routes::routes};

#[tokio::main]
async fn main() {
    init_tracing();

    let config = Config::from_env().expect("Config error");
    let redis_manager = init_redis(&config.redis_url).await.expect("Redis error");

    let http_client = Client::builder(TokioExecutor::new())
        .pool_max_idle_per_host(100)
        .build_http();

    let state = AppState {
        redis: redis_manager,
        config: config.clone(),
        http_client,
    };

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
