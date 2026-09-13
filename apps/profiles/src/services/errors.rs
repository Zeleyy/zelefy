#[derive(Debug, thiserror::Error)]
pub enum ProfileServiceError {
    #[error("User not found")]
    UserNotFound,

    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),
}
