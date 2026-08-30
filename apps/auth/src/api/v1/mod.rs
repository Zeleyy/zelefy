use axum::{Router, routing::post};

use crate::AppState;
use zelefy_common::paths;

pub mod auth;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(paths::v1::auth::LOGIN, post(auth::login))
        .route(paths::v1::auth::REGISTER, post(auth::register))
        .route(paths::v1::auth::REFRESH, post(auth::refresh))
        .route(paths::v1::auth::LOGOUT, post(auth::logout))
        .route(paths::v1::auth::LOGOUT_ALL, post(auth::logout_all))
}
