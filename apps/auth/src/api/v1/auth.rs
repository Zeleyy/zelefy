use axum::{Json, extract::State, http::{StatusCode}, response::IntoResponse};
use axum_extra::{TypedHeader, extract::{CookieJar, cookie::{Cookie, SameSite}}, headers::{Authorization, authorization::Bearer}};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use zelefy_common::{TokenData, paths};

use crate::{AppState, api::errors::{ApiError, ErrorResponse}, services::{self, login::LoginParams, logout::LogoutParams, logout_all::LogoutAllParams, refresh::RefreshParams, register::RegisterParams}};
// use super::paths;


#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct LoginRequest {
    #[schema(example = "user@example.com")]
    pub email: String,

    #[schema(example = "string")]
    pub password: String,
}

#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct LoginResponse {
    pub access_token: String,
    pub refresh_token: String,
}

#[utoipa::path(
    post,
    path = paths::v1::auth::LOGIN_FULL,
    responses(
        (status = 200, description = "Успешный вход в аккаунт", body = LoginResponse),
        (status = 400, description = "Неверные данные", body = ErrorResponse),
        (status = 401, description = "Неверные учётные данные", body = ErrorResponse),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    tag = "Auth"
)]
pub async fn login(
    State(mut state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, ApiError> {
    if payload.email.is_empty() {
        return Err(ApiError::BadRequest("Email не может быть пустым".into()));
    }

    if payload.password.len() < 6 {
        return Err(ApiError::BadRequest("Пароль должен содержать минимум 6 символов".into()));
    }

    let response = services::login(
        &state.db,
        &mut state.redis,
        &state.config,
        LoginParams {
            email: &payload.email,
            password: &payload.password,
        }
    )
    .await?;

    let cookie = Cookie::build(("rt_sec", response.refresh_token.clone()))
        .path("/")
        .http_only(true)
        .secure(true)
        .same_site(SameSite::Strict)
        .max_age(time::Duration::days(state.config.refresh_token_ttl_days))
        .build();

    Ok((
        [(axum::http::header::SET_COOKIE, cookie.to_string())],
        Json(LoginResponse {
            access_token: response.access_token,
            refresh_token: response.refresh_token,
        })
    ))
}


#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct RegisterRequest {
    #[schema(example = "user@example.com")]
    pub email: String,

    #[schema(example = "string")]
    pub password: String,
}

#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct RegisterResponse {
    pub access_token: String,
    pub refresh_token: String,
}

#[utoipa::path(
    post,
    path = paths::v1::auth::REGISTER_FULL,
    responses(
        (status = 200, description = "Успешная регистрация", body = RegisterResponse),
        (status = 400, description = "Неверные данные", body = ErrorResponse),
        (status = 409, description = "Пользователь уже существует", body = ErrorResponse),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    tag = "Auth"
)]
pub async fn register(
    State(mut state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<impl IntoResponse, ApiError> {
    if payload.email.is_empty() {
        return Err(ApiError::BadRequest("Email не может быть пустым".into()));
    }

    if payload.password.len() < 6 {
        return Err(ApiError::BadRequest("Пароль должен содержать минимум 8 символов".into()));
    }

    let response = services::register(
        &state.db,
        &mut state.redis,
        &state.config,
        RegisterParams {
            email: &payload.email,
            password: &payload.password,
        }
    )
    .await?;

    let cookie = Cookie::build(("rt_sec", response.refresh_token.clone()))
        .path("/")
        .http_only(true)
        .secure(true)
        .same_site(SameSite::Strict)
        .max_age(time::Duration::days(state.config.refresh_token_ttl_days))
        .build();
    
    Ok((
        [(axum::http::header::SET_COOKIE, cookie.to_string())],
        Json(RegisterResponse {
            access_token: response.access_token,
            refresh_token: response.refresh_token
        })
    ))
}



#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct RefreshRequest {
    #[schema(example = "rt_sec_1234567890abcdef...")]
    pub refresh_token: Option<String>,
}

#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct RefreshResponse {
    pub access_token: String,
    pub refresh_token: String,
}

#[utoipa::path(
    post,
    path = paths::v1::auth::REFRESH_FULL,
    responses(
        (status = 200, description = "Успешное обновление сессии", body = RefreshResponse),
        (status = 400, description = "Неверные данные", body = ErrorResponse),
        (status = 401, description = "Неверные учётные данные", body = ErrorResponse),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    tag = "Auth"
)]
pub async fn refresh(
    State(mut state): State<AppState>,
    jar: CookieJar,
    Json(payload): Json<RefreshRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let refresh_token = jar
        .get("rt_sec")
        .map(|cookie| cookie.value().to_string())
        .or(payload.refresh_token)
        .ok_or_else(|| ApiError::BadRequest("Refresh token не предоставлен".into()))?;

    let response = services::refresh(
        &state.db,
        &mut state.redis,
        &state.config,
        RefreshParams {
            refresh_token: &refresh_token,
        }
    )
    .await?;

    let cookie = Cookie::build(("rt_sec", response.refresh_token.clone()))
        .path("/")
        .http_only(true)
        .secure(true)
        .same_site(SameSite::Strict)
        .max_age(time::Duration::days(state.config.refresh_token_ttl_days))
        .build();

    Ok((
        [(axum::http::header::SET_COOKIE, cookie.to_string())],
        Json(RefreshResponse {
            access_token: response.access_token,
            refresh_token: response.refresh_token,
        }),
    ))
}


#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct LogoutRequest {
    #[schema(example = "rt_sec_1234567890abcdef...")]
    pub refresh_token: Option<String>,
}

#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct LogoutResponse {
    pub access_token: String,
    pub refresh_token: String,
}

#[utoipa::path(
    post,
    path = paths::v1::auth::LOGOUT_FULL,
    responses(
        (status = 200, description = "Успешный выход из системы"),
        (status = 400, description = "Неверные данные", body = ErrorResponse),
        (status = 401, description = "Неавторизован", body = ErrorResponse),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    security(("bearer_auth" = [])),
    tag = "Auth"
)]
pub async fn logout(
    State(mut state): State<AppState>,
    user: TokenData,
    jar: CookieJar,
    TypedHeader(Authorization(bearer)): TypedHeader<Authorization<Bearer>>,
    Json(payload): Json<LogoutRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let user_id = user.user_id;

    let refresh_token = jar
        .get("rt_sec")
        .map(|cookie| cookie.value().to_string())
        .or(payload.refresh_token)
        .ok_or_else(|| ApiError::BadRequest("Refresh token не предоставлен".into()))?;

    services::logout(
        &state.db,
        &mut state.redis,
        LogoutParams {
            user_id,
            access_token: bearer.token(),
            refresh_token: &refresh_token,
        }
    )
    .await?;

    let expired_cookie = Cookie::build(("rt_sec", ""))
        .path("/")
        .http_only(true)
        .secure(true)
        .same_site(SameSite::Strict)
        .max_age(time::Duration::ZERO)
        .build();

    Ok((
        [(axum::http::header::SET_COOKIE, expired_cookie.to_string())],
        StatusCode::OK,
    ))
}


#[utoipa::path(
    post,
    path = paths::v1::auth::LOGOUT_ALL_FULL,
    responses(
        (status = 200, description = "Успешный выход со всех устройств"),
        (status = 401, description = "Неавторизован", body = ErrorResponse),
        (status = 500, description = "Внутренняя ошибка сервера", body = ErrorResponse),
    ),
    security(("bearer_auth" = [])),
    tag = "Auth"
)]
pub async fn logout_all(
    State(mut state): State<AppState>,
    user: TokenData,
) -> Result<impl IntoResponse, ApiError> {
    let user_id = user.user_id;

    services::logout_all(
        &state.db,
        &mut state.redis,
        LogoutAllParams {
            user_id
        }
    )
    .await?;

    let expired_cookie = Cookie::build(("rt_sec", ""))
        .path("/")
        .http_only(true)
        .secure(true)
        .same_site(SameSite::Strict)
        .max_age(time::Duration::ZERO)
        .build();

    Ok((
        [(axum::http::header::SET_COOKIE, expired_cookie.to_string())],
        StatusCode::OK,
    ))
}
