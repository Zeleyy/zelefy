use axum::{Json, extract::{Path, State}, response::IntoResponse};
use zelefy_backend::api::errors::{ApiError, ErrorResponse};
use zelefy_common::paths;

use crate::{AppState, models::profiles::ProfileWithStats, services};

#[utoipa::path(
    get,
    path = paths::v1::profiles::PROFILE_BY_PERMALINK_FULL,
    params(
        ("permalink" = String, Path, description = "User permalink")
    ),
    responses(
        (status = 200, description = "", body = ProfileWithStats),
        (status = 404, description = "Пользователь не найден", body = ErrorResponse),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    tag = "Profile"
)]
pub async fn get_by_permalink(
    State(state): State<AppState>,
    Path(permalink): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    let response = services::get_by_permalink(
        &state.db,
        permalink,
    )
    .await?;

    Ok(Json(response))
}
