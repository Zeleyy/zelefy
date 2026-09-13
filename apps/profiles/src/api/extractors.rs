use axum::{extract::FromRequestParts, http::HeaderName};
use serde::de::DeserializeOwned;
use uuid::Uuid;
use zelefy_backend::{X_USER_ID, X_USER_ROLE, X_USER_SUBSCRIPTION, api::errors::ApiError};
use zelefy_common::TokenData;

use crate::{AppState, api::errors::ProfileErrorCode};


fn parse_header_enum<T: DeserializeOwned>(
    parts: &axum::http::request::Parts,
    header: &HeaderName,
    missing_code: &'static str,
    missing_msg: &'static str,
    invalid_code: &'static str,
    invalid_msg: &'static str,
) -> Result<T, ApiError> {
    let value_str = parts
        .headers
        .get(header)
        .ok_or_else(|| ApiError::bad_request(missing_code, missing_msg))?
        .to_str()
        .map_err(|_| ApiError::bad_request(invalid_code, invalid_msg))?;

    serde_json::from_slice::<T>(format_args!("\"{value_str}\"").to_string().as_bytes())
        .map_err(|_| ApiError::bad_request(invalid_code, invalid_msg))
}

impl FromRequestParts<AppState> for TokenData {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let user_id_str = parts
            .headers
            .get(&X_USER_ID)
            .ok_or_else(|| ApiError::unauthorized(
                ProfileErrorCode::MissingUserIdHeader.as_ref(),
                "Заголовок X-User-Id отсутствует",
            ))?
            .to_str()
            .map_err(|_| ApiError::unauthorized(
                ProfileErrorCode::InvalidCredentials.as_ref(),
                "Некорректный заголовок X-User-Id",
            ))?;

        let user_id = Uuid::parse_str(user_id_str).map_err(|_| {
            ApiError::bad_request(
                ProfileErrorCode::InvalidAccessToken.as_ref(),
                "Некорректный формат UUID",
            )
        })?;

        let role = parse_header_enum(
            parts,
            &X_USER_ROLE,
            ProfileErrorCode::MissingUserRoleHeader.as_ref(),
            "Заголовок X-User-Role отсутствует",
            ProfileErrorCode::InvalidUserRoleHeader.as_ref(),
            "Неизвестная роль пользователя",
        )
        .map_err(|e| ApiError::internal_msg(format!("gateway headers incomplete: {}", e.message)))?;

        let subscription = parse_header_enum(
            parts,
            &X_USER_SUBSCRIPTION,
            ProfileErrorCode::MissingUserSubscriptionHeader.as_ref(),
            "Заголовок X-User-Subscription отсутствует",
            ProfileErrorCode::InvalidUserSubscriptionHeader.as_ref(),
            "Неизвестная подписка пользователя",
        )
        .map_err(|e| ApiError::internal_msg(format!("gateway headers incomplete: {}", e.message)))?;

        Ok(TokenData { user_id, role, subscription })
    }
}
