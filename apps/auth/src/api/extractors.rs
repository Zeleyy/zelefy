use axum::extract::FromRequestParts;
use uuid::Uuid;
use zelefy_backend::{
    X_USER_ID, X_USER_ROLE, X_USER_SUBSCRIPTION, api::errors::ApiError, parse_header_enum,
};
use zelefy_common::TokenData;

use crate::{AppState, api::errors::AuthErrorCode};

impl FromRequestParts<AppState> for TokenData {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let user_id_str = parts
            .headers
            .get(&X_USER_ID)
            .ok_or_else(|| {
                ApiError::unauthorized(
                    AuthErrorCode::MissingUserIdHeader.as_ref(),
                    "Заголовок X-User-Id отсутствует",
                )
            })?
            .to_str()
            .map_err(|_| {
                ApiError::unauthorized(
                    AuthErrorCode::InvalidCredentials.as_ref(),
                    "Некорректный заголовок X-User-Id",
                )
            })?;

        let user_id = Uuid::parse_str(user_id_str).map_err(|_| {
            ApiError::bad_request(
                AuthErrorCode::InvalidAccessToken.as_ref(),
                "Некорректный формат UUID",
            )
        })?;

        let role = parse_header_enum(
            parts,
            &X_USER_ROLE,
            AuthErrorCode::MissingUserRoleHeader.as_ref(),
            "Заголовок X-User-Role отсутствует",
            AuthErrorCode::InvalidUserRoleHeader.as_ref(),
            "Неизвестная роль пользователя",
        )
        .map_err(|e| {
            ApiError::internal_msg(format!("gateway headers incomplete: {}", e.message))
        })?;

        let subscription = parse_header_enum(
            parts,
            &X_USER_SUBSCRIPTION,
            AuthErrorCode::MissingUserSubscriptionHeader.as_ref(),
            "Заголовок X-User-Subscription отсутствует",
            AuthErrorCode::InvalidUserSubscriptionHeader.as_ref(),
            "Неизвестная подписка пользователя",
        )
        .map_err(|e| {
            ApiError::internal_msg(format!("gateway headers incomplete: {}", e.message))
        })?;

        Ok(TokenData {
            user_id,
            role,
            subscription,
        })
    }
}
