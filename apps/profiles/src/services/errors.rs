#[derive(Debug, thiserror::Error)]
pub enum ProfileServiceError {
    #[error("User not found")]
    UserNotFound,

    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),

    #[error("S3 upload error: {0}")]
    S3UploadError(#[from] aws_sdk_s3::Error),
}
