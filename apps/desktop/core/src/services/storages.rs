use rusqlite::Connection;
use std::path::{Path, PathBuf};

use crate::{
    db::repository::storages,
    models::storages::{NewStorage, StorageType},
    services::errors::CoreError,
};

pub fn init_app_cache(
    conn: &Connection,
    app_data_dir: &Path,
    max_size_mb: u32,
) -> Result<(), CoreError> {
    let cache_path = match storages::get_by(conn, None, Some(StorageType::Cache), None)?.pop() {
        Some(storage) => PathBuf::from(storage.path),
        None => {
            let default_path = app_data_dir.join("cache");
            let path_str = default_path.to_string_lossy().to_string();

            let new_cache = NewStorage {
                path: path_str,
                storage_type: StorageType::Cache,
                is_primary: true,
                max_size_bytes: Some(max_size_mb as i64 * 1024 * 1024),
            };

            storages::create(conn, &new_cache)?;

            default_path
        }
    };

    if !cache_path.exists() {
        std::fs::create_dir_all(&cache_path)?;
    }

    Ok(())
}

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
        storage_type: StorageType::Library,
        is_primary: false,
        max_size_bytes: None,
    };

    let id = storages::create(conn, &new_storage)?;

    Ok(id)
}
