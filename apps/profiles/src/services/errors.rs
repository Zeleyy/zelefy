use zelefy_backend::api::error::ApiErrorCode;

#[derive(thiserror::Error, Debug, ApiErrorCode)]
pub enum ProfileServiceError {
    #[error("User not found")]
    #[api_error(status = 404, code = "USER_NOT_FOUND")]
    UserNotFound,

    #[error("Database error: {0}")]
    #[api_error(status = 500, code = "INTERNAL_ERROR")]
    DatabaseError(#[from] sqlx::Error),

    #[error("S3 upload error: {0}")]
    #[api_error(status = 500, code = "INTERNAL_ERROR")]
    S3UploadError(#[from] aws_sdk_s3::Error),
}
