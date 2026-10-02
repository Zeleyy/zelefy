use axum::Router;
use std::net::SocketAddr;
use zelefy_backend::{
    api::logs::{build_trace_layer, init_tracing},
    cache::init_cache,
    db::init_pool,
};

use zelefy_auth::{AppState, api, config::Config};

#[tokio::main]
async fn main() {
    init_tracing();

    let config = Config::from_env().expect("Ошибка загрузки конфигурации");

    let migrator = sqlx::migrate!("./migrations");
    let db_pool = init_pool(&config.database_url, Some(&migrator))
        .await
        .expect("Ошибка подключения к базе данных");

    let cache_manager = init_cache(&config.cache_url)
        .await
        .expect("Failed to initialize cache connection");

    let state = AppState {
        db: db_pool,
        cache: cache_manager,
        config: config.clone(),
    };

    let trace_layer = build_trace_layer();

    let app = Router::new()
        .merge(api::routes())
        .layer(trace_layer)
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("Сервер запущен на http://{}", addr);
    tracing::info!(
        "Swagger UI доступен по адресу: http://localhost:{}/docs",
        config.port
    );

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
