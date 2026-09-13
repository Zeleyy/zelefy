use axum::{Router, routing::get};
use zelefy_common::paths;

use crate::AppState;

pub mod profiles;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(paths::v1::profiles::PROFILE_BY_PERMALINK, get(profiles::get_by_permalink))
}
