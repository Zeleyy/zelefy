use rusqlite::Connection;
use std::path::PathBuf;

use crate::{db::repository::storages, models::storages::NewStorage, services::errors::CoreError};

pub fn create(conn: &Connection, new_storage: NewStorage) -> Result<i64, CoreError> {
    let path = PathBuf::from(&new_storage.path);

    if path.exists() {
        return Err(CoreError::PathAlreadyExists(new_storage.path.clone()));
    }

    std::fs::create_dir_all(&path)?;

    match storages::create(conn, &new_storage) {
        Ok(id) => Ok(id),
        Err(e) => {
            let _ = std::fs::remove_dir_all(&path);
            Err(e.into())
        }
    }
}
