use rusqlite::{Connection, params};
use std::path::PathBuf;

use crate::{
    db::repository::libraries,
    models::libraries::{NewLibrary, UpdateLibrary},
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
        "SELECT EXISTS(SELECT 1 FROM libraries WHERE is_primary = 1)",
        [],
        |row| row.get(0),
    )?;

    let new_library = NewLibrary {
        path: clean,
        is_primary: !has_primary,
    };

    let id = match libraries::create(&tx, &new_library) {
        Ok(id) => id,
        Err(e) => {
            if !dir_existed {
                let _ = std::fs::remove_dir_all(&canonical);
            }
            return Err(if is_unique_violation_on_path(&e) {
                CoreError::PathAlreadyExists(new_library.path)
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
    library_id: i64,
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

    let update_library = UpdateLibrary {
        path: Some(clean.clone()),
        ..Default::default()
    };

    let tx = conn.transaction()?;
    if let Err(e) = libraries::update(&tx, library_id, &update_library) {
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

pub fn set_primary_library(conn: &mut Connection, library_id: i64) -> Result<(), CoreError> {
    let tx = conn.transaction()?;

    let exists: bool = tx.query_row(
        "SELECT EXISTS(SELECT 1 FROM libraries WHERE library_id = ?1)",
        params![library_id],
        |row| row.get(0),
    )?;
    if !exists {
        return Err(CoreError::NotFound(library_id));
    }

    libraries::clear_primary(&tx, Some(library_id))?;
    libraries::update(
        &tx,
        library_id,
        &UpdateLibrary {
            is_primary: Some(true),
            ..Default::default()
        },
    )?;

    tx.commit()?;
    Ok(())
}
