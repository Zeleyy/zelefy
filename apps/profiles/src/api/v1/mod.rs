use axum::{
    Router,
    extract::DefaultBodyLimit,
    routing::{get, patch, post},
};
use zelefy_common::paths;

use crate::AppState;

pub mod profiles;

pub fn routes() -> Router<AppState> {
    const MAX_UPLOAD_SIZE: usize = 12 * 1024 * 1024;

    Router::new()
        .route(
            paths::v1::profiles::PROFILE_BY_PERMALINK,
            get(profiles::get_by_permalink),
        )
        .route(
            paths::v1::profiles::PROFILE,
            post(profiles::create).patch(profiles::update),
        )
        .route(
            paths::v1::profiles::PROFILE_AVATAR,
            patch(profiles::update_avatar).layer(DefaultBodyLimit::max(MAX_UPLOAD_SIZE)),
        )
        .route(
            paths::v1::profiles::PROFILE_BANNER,
            patch(profiles::update_banner).layer(DefaultBodyLimit::max(MAX_UPLOAD_SIZE)),
        )
}
