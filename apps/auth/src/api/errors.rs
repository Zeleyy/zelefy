use strum::AsRefStr;
use zelefy_backend::api::errors::ApiError;

use crate::services::errors::AuthServiceError;

impl From<AuthServiceError> for ApiError {
    fn from(err: AuthServiceError) -> Self {
        use AuthErrorCode::*;

        match err {
            AuthServiceError::InvalidCredentials => {
                ApiError::unauthorized(InvalidCredentials.as_ref(), "Неверный email или пароль")
            }
            AuthServiceError::UserAlreadyExists => ApiError::conflict(
                EmailAlreadyExists.as_ref(),
                "Пользователь с таким email уже существует",
            ),
            AuthServiceError::UserNotFound => {
                ApiError::not_found(UserNotFound.as_ref(), "Пользователь не найден")
            }
            AuthServiceError::InvalidToken => {
                ApiError::unauthorized(TokenExpired.as_ref(), "Токен недействителен или истёк")
            }
            AuthServiceError::HashingError(e) => ApiError::internal_msg(e),
            AuthServiceError::DatabaseError(e) => ApiError::internal(e),
            AuthServiceError::CacheError(e) => ApiError::internal_msg(e),
        }
    }
}

#[derive(Debug, Clone, Copy, AsRefStr)]
#[strum(serialize_all = "SCREAMING_SNAKE_CASE")]
pub enum AuthErrorCode {
    EmailAlreadyExists,
    InvalidCredentials,
    TokenExpired,
    UserNotFound,

    MissingAuthHeader,
    MalformedAuthHeader,
    InvalidAccessToken,
    SessionStoreError,
    MissingUserIdHeader,
    InvalidUserIdHeader,
    MissingUserRoleHeader,
    InvalidUserRoleHeader,
    MissingUserSubscriptionHeader,
    InvalidUserSubscriptionHeader,
}
