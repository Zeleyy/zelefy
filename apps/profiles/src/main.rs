use axum::Router;
use std::net::SocketAddr;

use zelefy_profiles::{AppState, api, config::Config, db::connection::init_pool};

#[tokio::main]
async fn main() {
    let config = Config::from_env().expect("Ошибка загрузки конфигурации");

    let db_pool = init_pool(&config.database_url).await.expect("Ошибка подключения к базе данных");

    let state = AppState {
        db: db_pool,
        config: config.clone(),
    };

    let app = Router::new()
        .merge(api::routes())
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    println!("Сервер запущен на http://{}", addr);
    println!("Swagger UI доступен по адресу: http://localhost:{}/docs", config.port);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
