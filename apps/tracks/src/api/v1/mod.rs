use axum::{
    Router,
    extract::DefaultBodyLimit,
    routing::{get, patch, post},
};
use zelefy_common::paths;

use crate::AppState;

pub mod tracks;

pub fn routes() -> Router<AppState> {
    const MAX_UPLOAD_SIZE: usize = 12 * 1024 * 1024;
    const MAX_UPLOAD_AUDIO_SIZE: usize = 102 * 1024 * 1024;

    Router::new()
        .route(
            paths::v1::tracks::TRACK_BY_PERMALINK,
            get(tracks::get_by_permalink),
        )
        .route(paths::v1::tracks::TRACK_BY_ID, patch(tracks::update))
        .route(
            paths::v1::tracks::TRACK_UPLOAD_AUDIO,
            post(tracks::upload_audio).layer(DefaultBodyLimit::max(MAX_UPLOAD_SIZE)),
        )
        .route(
            paths::v1::tracks::TRACK_COVER,
            patch(tracks::update_cover).layer(DefaultBodyLimit::max(MAX_UPLOAD_AUDIO_SIZE)),
        )
}
