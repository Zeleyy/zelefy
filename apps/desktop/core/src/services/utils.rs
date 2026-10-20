use rusqlite::{Error::SqliteFailure, ErrorCode::ConstraintViolation};

pub fn is_unique_violation_on_path(err: &rusqlite::Error) -> bool {
    match err {
        SqliteFailure(e, Some(msg)) => {
            e.code == ConstraintViolation && msg.contains("UNIQUE constraint failed: storages.path")
        }
        _ => false,
    }
}
