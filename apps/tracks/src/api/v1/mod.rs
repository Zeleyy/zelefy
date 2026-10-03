use axum::{
    Router,
    extract::DefaultBodyLimit,
    routing::{get, patch, post},
};
use zelefy_backend::img::{MAX_UPLOAD_AUDIO_SIZE, MAX_UPLOAD_COVER_SIZE};
use zelefy_common::paths;

use crate::AppState;

pub mod tracks;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            paths::v1::tracks::TRACK_BY_PERMALINK,
            get(tracks::get_by_permalink),
        )
        .route(paths::v1::tracks::TRACK_BY_ID, patch(tracks::update))
        .route(
            paths::v1::tracks::TRACK_UPLOAD_AUDIO,
            post(tracks::upload_audio).layer(DefaultBodyLimit::max(MAX_UPLOAD_AUDIO_SIZE)),
        )
        .route(
            paths::v1::tracks::TRACK_COVER,
            patch(tracks::update_cover).layer(DefaultBodyLimit::max(MAX_UPLOAD_COVER_SIZE)),
        )
}
