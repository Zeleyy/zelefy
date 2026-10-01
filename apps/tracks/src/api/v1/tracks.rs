use axum::{
    Json,
    extract::{Multipart, Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use uuid::Uuid;
use zelefy_backend::{
    TokenData,
    api::{
        error::{ApiError, ErrorResponse},
        multipart::{AudioForm, ImageForm, extract_file},
    },
};
use zelefy_common::paths;

use crate::{AppState, models::tracks::TrackWithStats, services};

#[utoipa::path(
    post,
    path = paths::v1::tracks::TRACK_UPLOAD_AUDIO_FULL,
    request_body(
        description = "файл трека",
        content = inline(AudioForm),
        content_type = "multipart/form-data",
    ),
    responses(
        (status = 202, description = "Трек создан, обработка запущена", body = TrackWithStats),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    tag = "Track"
)]
pub async fn upload_audio(
    State(state): State<AppState>,
    user: TokenData,
    multipart: Multipart,
) -> Result<impl IntoResponse, ApiError> {
    let user_id = user.user_id;

    let (bytes, content_type) = extract_file(multipart, "audio_file").await?;

    let track = services::upload_audio(
        state.db,
        state.s3_client,
        state.config,
        user_id,
        bytes,
        content_type,
    )
    .await?;

    Ok((StatusCode::ACCEPTED, Json(track)))
}

#[utoipa::path(
    patch,
    path = paths::v1::tracks::TRACK_COVER_FULL,
    params(
        ("track_id" = Uuid, Path, description = "Track Uuid")
    ),
    request_body(
        description = "файл изображения",
        content = inline(ImageForm),
        content_type = "multipart/form-data",
    ),
    responses(
        (status = 200, description = "Обложка трека обновлена", body = TrackWithStats),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    tag = "Track"
)]
pub async fn update_cover(
    State(state): State<AppState>,
    user: TokenData,
    Path(track_id): Path<Uuid>,
    multipart: Multipart,
) -> Result<impl IntoResponse, ApiError> {
    let (bytes, content_type) = extract_file(multipart, "file").await?;

    let track = services::update_cover(
        state.db,
        state.s3_client,
        state.config,
        user.user_id,
        track_id,
        bytes,
        content_type,
    )
    .await?;

    Ok(Json(track))
}
