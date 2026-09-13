use std::collections::HashMap;

use axum::{Json, body::Bytes, extract::{Multipart, Path, State}, response::IntoResponse};
use serde::Deserialize;
use utoipa::ToSchema;
use zelefy_backend::api::errors::{ApiError, ErrorResponse};
use zelefy_common::{TokenData, paths};

use crate::{AppState, models::profiles::{CreateProfileDto, ProfileWithStats}, services};

#[derive(ToSchema)]
pub struct ImageForm {
    #[schema(value_type = String, format = Binary)]
    pub file: String,
}


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


#[utoipa::path(
    post,
    path = paths::v1::profiles::PROFILE_FULL,
    responses(
        (status = 200, description = "Успешное создание профиля"),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    tag = "Profile",
)]
pub async fn create(
    State(_state): State<AppState>,
    Json(_payload): Json<CreateProfileDto>,
) -> Result<impl IntoResponse, ApiError> {
    Ok(())
}


#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateRequest {
    pub display_name: Option<String>,
    pub permalink: Option<String>,
    pub bio: Option<Option<String>>,
    pub location: Option<Option<String>>,
    pub social_links: Option<HashMap<String, String>>,
}

#[utoipa::path(
    patch,
    path = paths::v1::profiles::PROFILE_FULL,
    responses(
        (status = 200, description = "Успешное обновление данных профиля"),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    tag = "Profile",
)]
pub async fn update(
    State(_state): State<AppState>,
    user: TokenData,
    Json(_payload): Json<UpdateRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let _user_id = user.user_id;

    Ok(())
}

async fn extract_file(mut multipart: Multipart, field_name: &str) -> Result<Bytes, ApiError> {
    while let Some(field) = multipart.next_field().await.map_err(|_| ApiError::internal_msg("Ошибка формы"))? {
        if field.name() == Some(field_name) {
            return field.bytes().await.map_err(|_| ApiError::internal_msg("Ошибка чтения файла"));
        }
    }
    Err(ApiError::internal_msg("Файл не передан"))
}

#[utoipa::path(
    patch,
    path = paths::v1::profiles::PROFILE_AVATAR_FULL,
    request_body(
        content = inline(ImageForm),
        content_type = "multipart/form-data",
    ),
    responses(
        (status = 200, description = "Успешное обновление аватара профиля"),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    tag = "Profile",
)]
pub async fn update_avatar(
    State(_state): State<AppState>,
    user: TokenData,
    multipart: Multipart,
) -> Result<impl IntoResponse, ApiError> {
    let _user_id = user.user_id;

    let bytes = extract_file(multipart, "file").await?;

    println!("Принят файл размером: {} байт", bytes.len());

    Ok(())
}


#[utoipa::path(
    patch,
    path = paths::v1::profiles::PROFILE_BANNER_FULL,
    request_body(
        content = inline(ImageForm),
        content_type = "multipart/form-data",
    ),
    responses(
        (status = 200, description = "Успешное обновление баннера профиля"),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    tag = "Profile",
)]
pub async fn update_banner(
    State(_state): State<AppState>,
    user: TokenData,
    multipart: Multipart,
) -> Result<impl IntoResponse, ApiError> {
    let _user_id = user.user_id;

    let bytes = extract_file(multipart, "file").await?;

    println!("Принят файл размером: {} байт", bytes.len());

    Ok(())
}
