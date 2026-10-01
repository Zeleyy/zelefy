use zelefy_backend::api::error::ApiErrorCode;

#[derive(thiserror::Error, Debug, ApiErrorCode)]
pub enum TrackServiceError {
    #[error("No fields to update")]
    #[api_error(status = 400, code = "EMPTY_UPDATE")]
    EmptyUpdate,

    #[error("Unsupported audio format")]
    #[api_error(status = 400, code = "UNSUPPORTED_AUDIO_FORMAT")]
    UnsupportedAudioFormat,

    #[error("You don't have permission")]
    #[api_error(status = 403, code = "FORBIDDEN")]
    Forbidden,

    #[error("Track not found")]
    #[api_error(status = 404, code = "TRACK_NOT_FOUND")]
    TrackNotFound,

    #[error("Database error: {0}")]
    #[api_error(status = 500, code = "INTERNAL_ERROR")]
    DatabaseError(#[from] sqlx::Error),

    #[error("S3 upload error: {0}")]
    #[api_error(status = 500, code = "INTERNAL_ERROR")]
    S3UploadError(#[from] aws_sdk_s3::Error),
}
