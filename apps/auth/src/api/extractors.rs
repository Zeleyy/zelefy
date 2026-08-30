use axum::{extract::FromRequestParts, http::HeaderName};
use serde::de::DeserializeOwned;
use uuid::Uuid;
use zelefy_common::TokenData;
use zelefy_backend::{X_USER_ID, X_USER_ROLE, X_USER_SUBSCRIPTION};

use crate::{AppState, api::errors::ApiError, cache::repository::get_session};


fn parse_header_enum<T: DeserializeOwned>(
    parts: &axum::http::request::Parts,
    header: &HeaderName,
    err_missing: &'static str,
    err_invalid: &'static str,
) -> Result<T, ApiError> {
    let value_str = parts
        .headers
        .get(header)
        .ok_or_else(|| ApiError::Unauthorized(err_missing.into()))?
        .to_str()
        .map_err(|_| ApiError::BadRequest(err_invalid.into()))?;

    serde_json::from_slice::<T>(format_args!("\"{value_str}\"").to_string().as_bytes())
        .map_err(|_| ApiError::BadRequest(err_invalid.into()))
}


impl FromRequestParts<AppState> for TokenData {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        if let Some(user_id_header) = parts.headers.get(&X_USER_ID) {
            let user_id_str = user_id_header
                .to_str()
                .map_err(|_| ApiError::Unauthorized("Некорректный заголовок X-User-Id".into()))?;

            let user_id = Uuid::parse_str(user_id_str)
                .map_err(|_| ApiError::BadRequest("Некорректный формат UUID".into()))?;

            let role = parse_header_enum(
                parts,
                &X_USER_ROLE,
                "Заголовок X-User-Role отсутствует",
                "Неизвестная роль пользователя",
            )?;

            let subscription = parse_header_enum(
                parts,
                &X_USER_SUBSCRIPTION,
                "Заголовок X-User-Subscription отсутствует",
                "Неизвестная подписка пользователя",
            )?;

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
            .ok_or_else(|| ApiError::Unauthorized("Токен авторизации не предоставлен".into()))?;

        let access_token = auth_header
            .strip_prefix("Bearer ")
            .ok_or_else(|| ApiError::Unauthorized("Неверный формат заголовка Authorization".into()))?;

        let mut redis_conn = state.redis.clone();
        
        let session = get_session(&mut redis_conn, access_token)
            .await
            .map_err(|_| ApiError::Unauthorized("Ошибка обращения к хранилищу сессий".into()))?
            .ok_or_else(|| ApiError::Unauthorized("Недействительный access token".into()))?;

        Ok(session)
    }
}
