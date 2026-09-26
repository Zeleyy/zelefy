use zelefy_backend::api::error::ApiErrorCode;

#[derive(thiserror::Error, Debug, ApiErrorCode)]
pub enum AuthServiceError {
    #[error("Refresh token not provided")]
    #[api_error(status = 400, code = "REFRESH_TOKEN_MISSING")]
    MissingRefreshToken,

    #[error("Invalid email or password")]
    #[api_error(status = 401, code = "INVALID_CREDENTIALS")]
    InvalidCredentials,

    #[error("Session expired or invalid")]
    #[api_error(status = 401, code = "INVALID_TOKEN")]
    InvalidToken,

    #[error("User already exists")]
    #[api_error(status = 409, code = "EMAIL_ALREADY_EXISTS")]
    UserAlreadyExists,

    #[error("Hashing error: {0}")]
    #[api_error(status = 500, code = "INTERNAL_ERROR")]
    HashingError(String),

    #[error("Database error: {0}")]
    #[api_error(status = 500, code = "INTERNAL_ERROR")]
    DatabaseError(#[from] sqlx::Error),

    #[error("Cache error: {0}")]
    #[api_error(status = 500, code = "INTERNAL_ERROR")]
    CacheError(String),
}
