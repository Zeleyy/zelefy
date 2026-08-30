use thiserror::Error;


#[derive(Debug, Error)]
pub enum AuthServiceError {
    #[error("Invalid email or password")]
    InvalidCredentials,

    #[error("User already exists")]
    UserAlreadyExists,

    #[error("User not found")]
    UserNotFound,

    #[error("Session expired or invalid")]
    InvalidToken,

    #[error("Hashing error: {0}")]
    HashingError(String),

    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),

    #[error("Cache/Redis error: {0}")]
    CacheError(String),
}