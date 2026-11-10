use crate::audio::errors::EngineError;

#[derive(Debug, thiserror::Error)]
pub enum CoreError {
    #[error("validation error: {0}")]
    Validation(String),

    #[error("database error: {0}")]
    Db(#[from] rusqlite::Error),

    #[error("io error: {0}")]
    Io(#[from] std::io::Error),

    #[error("path already exists: {0}")]
    PathAlreadyExists(String),

    #[error("invalid path: {0}")]
    InvalidPath(String),

    #[error("not found: {0}")]
    NotFound(i64),

    #[error(transparent)]
    Engine(#[from] EngineError),

    #[error("audio engine is not running")]
    EngineUnavailable,

    #[error("audio engine did not respond in time")]
    EngineTimeout,
}
