use zelefy_backend::api::error::ApiErrorCode;

#[derive(thiserror::Error, Debug, ApiErrorCode)]
pub enum ProfileServiceError {
    #[error("No fields to update")]
    #[api_error(status = 400, code = "EMPTY_UPDATE")]
    EmptyUpdate,

    #[error("Unsupported image format")]
    #[api_error(status = 400, code = "UNSUPPORTED_IMAGE_FORMAT")]
    UnsupportedImageFormat,

    #[error("User not found")]
    #[api_error(status = 404, code = "USER_NOT_FOUND")]
    UserNotFound,

    #[error("Image processing failed: {0}")]
    #[api_error(status = 500, code = "IMAGE_PROCESSING_FAILED")]
    ImageProcessingFailed(String),

    #[error("Database error: {0}")]
    #[api_error(status = 500, code = "INTERNAL_ERROR")]
    DatabaseError(#[from] sqlx::Error),

    #[error("S3 upload error: {0}")]
    #[api_error(status = 500, code = "INTERNAL_ERROR")]
    S3UploadError(#[from] aws_sdk_s3::Error),
}
