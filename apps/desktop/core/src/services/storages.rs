use rusqlite::Connection;
use std::path::PathBuf;

use crate::{db::repository::storages, models::storages::NewStorage, services::errors::CoreError};

pub fn create_user_library(conn: &Connection, raw_path: String) -> Result<i64, CoreError> {
    let path = PathBuf::from(&raw_path);

    if !path.exists() {
        std::fs::create_dir_all(&path)?;
    }

    let canonical_path = path
        .canonicalize()
        .map_err(|_| CoreError::InvalidPath(raw_path.clone()))?
        .to_string_lossy()
        .to_string();

    let new_storage = NewStorage {
        path: canonical_path,
        is_primary: false,
        max_size_bytes: None,
    };

    let id = storages::create(conn, &new_storage)?;

    Ok(id)
}
