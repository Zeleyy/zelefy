use rusqlite::{Connection, params};
use std::path::PathBuf;

use crate::{
    db::repository::storages,
    models::storages::{NewStorage, UpdateStorage},
    services::{errors::CoreError, utils::is_unique_violation_on_path},
    storage::{DataDirs, resolve_data_root},
};

pub fn create_user_library(conn: &mut Connection, raw_path: String) -> Result<i64, CoreError> {
    let chosen = PathBuf::from(&raw_path);
    let library_root = resolve_data_root(&chosen, "library");

    let dir_existed = library_root.exists();

    DataDirs::under(&library_root)
        .create()
        .map_err(CoreError::Io)?;

    let canonical = match library_root.canonicalize() {
        Ok(p) => p,
        Err(_) => {
            if !dir_existed {
                let _ = std::fs::remove_dir_all(&library_root);
            }
            return Err(CoreError::InvalidPath(raw_path));
        }
    };

    let clean = dunce::simplified(&canonical).to_string_lossy().to_string();

    let tx = conn.transaction()?;

    let has_primary: bool = tx.query_row(
        "SELECT EXISTS(SELECT 1 FROM storages WHERE is_primary = 1)",
        [],
        |row| row.get(0),
    )?;

    let new_storage = NewStorage {
        path: clean,
        is_primary: !has_primary,
        max_size_bytes: None,
    };

    let id = match storages::create(&tx, &new_storage) {
        Ok(id) => id,
        Err(e) => {
            if !dir_existed {
                let _ = std::fs::remove_dir_all(&canonical);
            }
            return Err(if is_unique_violation_on_path(&e) {
                CoreError::PathAlreadyExists(new_storage.path)
            } else {
                e.into()
            });
        }
    };

    if let Err(e) = tx.commit() {
        if !dir_existed {
            let _ = std::fs::remove_dir_all(&canonical);
        }
        return Err(e.into());
    }

    Ok(id)
}

pub fn update_user_library(
    conn: &mut Connection,
    storage_id: i64,
    raw_path: String,
) -> Result<(), CoreError> {
    let chosen = PathBuf::from(&raw_path);
    let library_root = resolve_data_root(&chosen, "library");

    let dir_existed = library_root.exists();

    DataDirs::under(&library_root)
        .create()
        .map_err(CoreError::Io)?;

    let canonical = match library_root.canonicalize() {
        Ok(p) => p,
        Err(_) => {
            if !dir_existed {
                let _ = std::fs::remove_dir_all(&library_root);
            }
            return Err(CoreError::InvalidPath(raw_path));
        }
    };

    let clean = dunce::simplified(&canonical).to_string_lossy().to_string();

    let update_storage = UpdateStorage {
        path: Some(clean.clone()),
        ..Default::default()
    };

    let tx = conn.transaction()?;
    if let Err(e) = storages::update(&tx, storage_id, &update_storage) {
        if !dir_existed {
            let _ = std::fs::remove_dir_all(&canonical);
        }
        return Err(if is_unique_violation_on_path(&e) {
            CoreError::PathAlreadyExists(clean)
        } else {
            e.into()
        });
    }

    if let Err(e) = tx.commit() {
        if !dir_existed {
            let _ = std::fs::remove_dir_all(&canonical);
        }
        return Err(e.into());
    }

    Ok(())
}

pub fn set_primary_library(conn: &mut Connection, storage_id: i64) -> Result<(), CoreError> {
    let tx = conn.transaction()?;

    let exists: bool = tx.query_row(
        "SELECT EXISTS(SELECT 1 FROM storages WHERE storage_id = ?1)",
        params![storage_id],
        |row| row.get(0),
    )?;
    if !exists {
        return Err(CoreError::NotFound(storage_id));
    }

    storages::clear_primary(&tx, Some(storage_id))?;
    storages::update(
        &tx,
        storage_id,
        &UpdateStorage {
            is_primary: Some(true),
            ..Default::default()
        },
    )?;

    tx.commit()?;
    Ok(())
}
