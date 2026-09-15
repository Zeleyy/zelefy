use axum::{extract::FromRequestParts, http::HeaderName};
use serde::de::DeserializeOwned;
use uuid::Uuid;
use zelefy_backend::{X_USER_ID, X_USER_ROLE, X_USER_SUBSCRIPTION, api::errors::ApiError};
use zelefy_common::TokenData;

use crate::{AppState, api::errors::AuthErrorCode, cache::repository::get_session};

fn parse_header_enum<T: DeserializeOwned>(
    parts: &axum::http::request::Parts,
    header: &HeaderName,
    missing_code: AuthErrorCode,
    missing_msg: &'static str,
    invalid_code: AuthErrorCode,
    invalid_msg: &'static str,
) -> Result<T, ApiError> {
    let value_str = parts
        .headers
        .get(header)
        .ok_or_else(|| ApiError::bad_request(missing_code.as_str(), missing_msg))?
        .to_str()
        .map_err(|_| ApiError::bad_request(invalid_code.as_str(), invalid_msg))?;

    serde_json::from_slice::<T>(format_args!("\"{value_str}\"").to_string().as_bytes())
        .map_err(|_| ApiError::bad_request(invalid_code.as_str(), invalid_msg))
}

impl FromRequestParts<AppState> for TokenData {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        if let Some(user_id_header) = parts.headers.get(&X_USER_ID) {
            let user_id_str = user_id_header.to_str().map_err(|_| {
                ApiError::unauthorized(
                    AuthErrorCode::InvalidCredentials.as_str(),
                    "Некорректный заголовок X-User-Id",
                )
            })?;

            let user_id = Uuid::parse_str(user_id_str).map_err(|_| {
                ApiError::bad_request(
                    AuthErrorCode::InvalidAccessToken.as_str(),
                    "Некорректный формат UUID",
                )
            })?;

            let role = parse_header_enum(
                parts,
                &X_USER_ROLE,
                AuthErrorCode::MissingUserRoleHeader,
                "Заголовок X-User-Role отсутствует",
                AuthErrorCode::InvalidUserRoleHeader,
                "Неизвестная роль пользователя",
            )
            .map_err(|e| {
                ApiError::internal_msg(format!("gateway headers incomplete: {}", e.message))
            })?;

            let subscription = parse_header_enum(
                parts,
                &X_USER_SUBSCRIPTION,
                AuthErrorCode::MissingUserSubscriptionHeader,
                "Заголовок X-User-Subscription отсутствует",
                AuthErrorCode::InvalidUserSubscriptionHeader,
                "Неизвестная подписка пользователя",
            )
            .map_err(|e| {
                ApiError::internal_msg(format!("gateway headers incomplete: {}", e.message))
            })?;

            return Ok(TokenData {
                user_id,
                role,
                subscription,
            });
        }

        let auth_header = parts
            .headers
            .get(axum::http::header::AUTHORIZATION)
            .and_then(|v| v.to_str().ok())
            .ok_or_else(|| {
                ApiError::unauthorized(
                    AuthErrorCode::TokenExpired.as_str(),
                    "Токен авторизации не предоставлен",
                )
            })?;

        let access_token = auth_header.strip_prefix("Bearer ").ok_or_else(|| {
            ApiError::unauthorized(
                AuthErrorCode::InvalidAccessToken.as_str(),
                "Неверный формат заголовка Authorization",
            )
        })?;

        let mut redis_conn = state.redis.clone();

        let session = get_session(&mut redis_conn, access_token)
            .await
            .map_err(|_| ApiError::internal_msg("Ошибка обращения к хранилищу сессий"))?
            .ok_or_else(|| {
                ApiError::unauthorized(
                    AuthErrorCode::TokenExpired.as_str(),
                    "Недействительный access token",
                )
            })?;

        Ok(session)
    }
}
