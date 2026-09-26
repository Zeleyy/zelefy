use axum::extract::FromRequestParts;
use uuid::Uuid;
use zelefy_backend::{
    X_USER_ID, X_USER_ROLE, X_USER_SUBSCRIPTION,
    api::error::{ApiError, AuthContextError},
    parse_header_enum,
};
use zelefy_common::TokenData;

use crate::AppState;

impl FromRequestParts<AppState> for TokenData {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let user_id_str = parts
            .headers
            .get(&X_USER_ID)
            .ok_or(AuthContextError::MissingUserIdHeader)?
            .to_str()
            .map_err(|_| AuthContextError::InvalidUserIdHeader)?;

        let user_id =
            Uuid::parse_str(user_id_str).map_err(|_| AuthContextError::InvalidAccessToken)?;

        let role = parse_header_enum(
            parts,
            &X_USER_ROLE,
            AuthContextError::MissingUserRoleHeader,
            AuthContextError::InvalidUserRoleHeader,
        )
        .map_err(|e| {
            ApiError::internal_msg(format!("gateway headers incomplete: {}", e.message))
        })?;

        let subscription = parse_header_enum(
            parts,
            &X_USER_SUBSCRIPTION,
            AuthContextError::MissingUserSubscriptionHeader,
            AuthContextError::InvalidUserSubscriptionHeader,
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
