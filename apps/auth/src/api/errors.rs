use zelefy_backend::api::errors::ApiError;

use crate::services::errors::AuthServiceError;

impl From<AuthServiceError> for ApiError {
    fn from(err: AuthServiceError) -> Self {
        use AuthErrorCode::*;

        match err {
            AuthServiceError::InvalidCredentials => {
                ApiError::unauthorized(InvalidCredentials.as_str(), "Неверный email или пароль")
            }
            AuthServiceError::UserAlreadyExists => {
                ApiError::conflict(EmailAlreadyExists.as_str(), "Пользователь с таким email уже существует")
            }
            AuthServiceError::UserNotFound => {
                ApiError::not_found(UserNotFound.as_str(), "Пользователь не найден")
            }
            AuthServiceError::InvalidToken => {
                ApiError::unauthorized(TokenExpired.as_str(), "Токен недействителен или истёк")
            }
            AuthServiceError::HashingError(e) => ApiError::internal_msg(e),
            AuthServiceError::DatabaseError(e) => ApiError::internal(e),
            AuthServiceError::CacheError(e) => ApiError::internal_msg(e),
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub enum AuthErrorCode {
    EmailAlreadyExists,
    InvalidCredentials,
    TokenExpired,
    UserNotFound,

    MissingAuthHeader,
    MalformedAuthHeader,
    InvalidAccessToken,
    SessionStoreError,
    MissingUserRoleHeader,
    InvalidUserRoleHeader,
    MissingUserSubscriptionHeader,
    InvalidUserSubscriptionHeader,
    InvalidUserIdHeader,
}

impl AuthErrorCode {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::EmailAlreadyExists => "EMAIL_ALREADY_EXISTS",
            Self::InvalidCredentials => "INVALID_CREDENTIALS",
            Self::TokenExpired => "TOKEN_EXPIRED",
            Self::UserNotFound => "USER_NOT_FOUND",
            Self::MissingAuthHeader => "MISSING_AUTH_HEADER",
            Self::MalformedAuthHeader => "MALFORMED_AUTH_HEADER",
            Self::InvalidAccessToken => "INVALID_ACCESS_TOKEN",
            Self::SessionStoreError => "SESSION_STORE_ERROR",
            Self::MissingUserRoleHeader => "MISSING_USER_ROLE_HEADER",
            Self::InvalidUserRoleHeader => "INVALID_USER_ROLE_HEADER",
            Self::MissingUserSubscriptionHeader => "MISSING_USER_SUBSCRIPTION_HEADER",
            Self::InvalidUserSubscriptionHeader => "INVALID_USER_SUBSCRIPTION_HEADER",
            Self::InvalidUserIdHeader => "INVALID_USER_ID_HEADER",
        }
    }
}
