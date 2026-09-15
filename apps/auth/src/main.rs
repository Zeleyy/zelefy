use axum::Router;
use std::net::SocketAddr;
use zelefy_backend::{
    api::logs::{build_trace_layer, init_tracing},
    db::init_pool,
};

use zelefy_auth::{AppState, api, cache::connection::init_redis, config::Config};

#[tokio::main]
async fn main() {
    init_tracing();

    let config = Config::from_env().expect("Ошибка загрузки конфигурации");

    let migrator = sqlx::migrate!("./migrations");
    let db_pool = init_pool(&config.database_url, Some(&migrator))
        .await
        .expect("Ошибка подключения к базе данных");

    let redis_manager = init_redis(&config.redis_url)
        .await
        .expect("Ошибка подключения к Redis");

    let state = AppState {
        db: db_pool,
        redis: redis_manager,
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
