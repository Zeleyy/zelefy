use axum::{
    Json,
    extract::{Multipart, Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use serde::Deserialize;
use utoipa::ToSchema;
use zelefy_backend::{
    TokenData,
    api::{
        error::{ApiError, ErrorResponse},
        multipart::{ImageForm, extract_file},
    },
};
use zelefy_common::{
    paths,
    profiles::{DeleteProfileSocialLink, NewProfile, NewProfileSocialLink, ProfileDetails},
};

use crate::{
    AppState,
    services::{
        self, update::UpdateParams, update_avatar::UpdateAvatarResponse,
        update_banner::UpdateBannerResponse,
    },
};

#[utoipa::path(
    get,
    path = paths::v1::profiles::PROFILE_BY_PERMALINK_FULL,
    params(
        ("permalink" = String, Path, description = "User permalink")
    ),
    responses(
        (status = 200, description = "Пользователь получен", body = ProfileDetails),
        (status = 404, description = "Пользователь не найден", body = ErrorResponse),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    security(),
    tag = "Profile"
)]
pub async fn get_by_permalink(
    State(state): State<AppState>,
    Path(permalink): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    let response = services::get_by_permalink(state.db, permalink).await?;

    Ok(Json(response))
}

#[utoipa::path(
    post,
    path = paths::v1::profiles::PROFILE_FULL,
    responses(
        (status = 201, description = "Профиль создан", body = ProfileDetails),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    tag = "Profile",
)]
pub async fn create(
    State(state): State<AppState>,
    user: TokenData,
    Json(payload): Json<NewProfile>,
) -> Result<impl IntoResponse, ApiError> {
    let user_id = user.user_id;

    let response = services::create(state.db, user_id, payload).await?;

    Ok((StatusCode::CREATED, Json(response)))
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateRequest {
    pub display_name: Option<String>,
    pub permalink: Option<String>,
    pub bio: Option<Option<String>>,
    pub location: Option<Option<String>>,
    pub new_social_links: Option<Vec<NewProfileSocialLink>>,
    pub delete_social_links: Option<Vec<DeleteProfileSocialLink>>,
}

#[utoipa::path(
    patch,
    path = paths::v1::profiles::PROFILE_FULL,
    responses(
        (status = 200, description = "Успешное обновление данных профиля", body = ProfileDetails),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    tag = "Profile",
)]
pub async fn update(
    State(state): State<AppState>,
    user: TokenData,
    Json(payload): Json<UpdateRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let user_id = user.user_id;

    let response = services::update(
        state.db,
        user_id,
        UpdateParams {
            display_name: payload.display_name,
            permalink: payload.permalink,
            bio: payload.bio,
            location: payload.location,
            new_social_links: payload.new_social_links,
            delete_social_links: payload.delete_social_links,
        },
    )
    .await?;

    Ok(Json(response))
}

#[utoipa::path(
    patch,
    path = paths::v1::profiles::PROFILE_AVATAR_FULL,
    request_body(
        description = "файл изображения",
        content = inline(ImageForm),
        content_type = "multipart/form-data",
    ),
    responses(
        (status = 200, description = "Успешное обновление аватара профиля", body = UpdateAvatarResponse),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    tag = "Profile",
)]
pub async fn update_avatar(
    State(state): State<AppState>,
    user: TokenData,
    multipart: Multipart,
) -> Result<impl IntoResponse, ApiError> {
    let user_id = user.user_id;

    let (bytes, content_type) = extract_file(multipart, "file").await?;

    let response = services::update_avatar(
        state.db,
        state.s3_client,
        state.config,
        user_id,
        bytes,
        content_type,
    )
    .await?;

    Ok(Json(response))
}

#[utoipa::path(
    patch,
    path = paths::v1::profiles::PROFILE_BANNER_FULL,
    request_body(
        description = "файл изображения",
        content = inline(ImageForm),
        content_type = "multipart/form-data",
    ),
    responses(
        (status = 200, description = "Успешное обновление баннера профиля", body = UpdateBannerResponse),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    tag = "Profile",
)]
pub async fn update_banner(
    State(state): State<AppState>,
    user: TokenData,
    multipart: Multipart,
) -> Result<impl IntoResponse, ApiError> {
    let user_id = user.user_id;

    let (bytes, content_type) = extract_file(multipart, "file").await?;

    let response = services::update_banner(
        state.db,
        state.s3_client,
        state.config,
        user_id,
        bytes,
        content_type,
    )
    .await?;

    Ok(Json(response))
}
