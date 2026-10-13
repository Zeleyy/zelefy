#[derive(Debug, thiserror::Error)]
pub enum CoreError {
    #[error("database error: {0}")]
    Db(#[from] rusqlite::Error),

    #[error("io error: {0}")]
    Io(#[from] std::io::Error),

    #[error("storage path already exists: {0}")]
    PathAlreadyExists(String),

    #[error("storage not found: {0}")]
    NotFound(i64),
}
