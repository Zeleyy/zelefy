use axum::Router;
use zelefy_backend::{api::logs::{build_trace_layer, init_tracing}, s3::create_s3_client};
use std::net::SocketAddr;

use zelefy_profiles::{AppState, api, config::Config, db::connection::init_pool};

#[tokio::main]
async fn main() {
    init_tracing();

    let config = Config::from_env().expect("Ошибка загрузки конфигурации");

    let db_pool = init_pool(&config.database_url).await.expect("Ошибка подключения к базе данных");
    let s3_client = create_s3_client(
        &config.s3_url,
        &config.s3_access_key,
        &config.s3_secret_key,
        &config.s3_region,
    );

    let state = AppState {
        db: db_pool,
        config: config.clone(),
        s3_client,
    };

    let trace_layer = build_trace_layer();

    let app = Router::new()
        .merge(api::routes())
        .layer(trace_layer)
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("Сервер запущен на http://{}", addr);
    tracing::info!("Swagger UI доступен по адресу: http://localhost:{}/docs", config.port);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
