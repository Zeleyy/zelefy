use desktop_core::{
    db::{repository, DbState},
    models::libraries::{Library, LibraryStats},
    services,
};
use tauri::{AppHandle, Manager, State};

use crate::cache::AppCache;

pub fn refresh_asset_scope(app: &AppHandle) -> Result<(), String> {
    let scope = app.asset_protocol_scope();

    let cache = app.state::<AppCache>();
    scope
        .allow_directory(cache.active_root(), true)
        .map_err(|e| format!("Ошибка добавления кеша: {e}"))?;

    let libraries = {
        let db = app.state::<DbState>();
        let conn = db.conn.lock().unwrap_or_else(|e| e.into_inner());
        repository::libraries::get_all(&conn)
            .map_err(|e| format!("Ошибка получения локальных хранилищ: {e}"))?
    };

    for lib in &libraries {
        scope
            .allow_directory(&lib.path, true)
            .map_err(|e| format!("Ошибка добавления {}: {e}", lib.path))?;
    }

    Ok(())
}

#[tauri::command]
pub fn get_libraries(db: State<'_, DbState>) -> Result<Vec<Library>, String> {
    let conn = db.lock();
    repository::libraries::get_all(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_libraries_stats(db: State<'_, DbState>) -> Result<Vec<LibraryStats>, String> {
    let conn = db.lock();
    repository::libraries::get_stats(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_user_library(app: AppHandle, path: String) -> Result<i64, String> {
    let new_library_id = {
        let db = app.state::<DbState>();
        let mut conn = db.conn.lock().unwrap_or_else(|e| e.into_inner());

        services::libraries::create_user_library(&mut conn, path).map_err(|e| e.to_string())?
    };

    refresh_asset_scope(&app)?;

    Ok(new_library_id)
}

#[tauri::command]
pub fn update_user_library(app: AppHandle, library_id: i64, path: String) -> Result<(), String> {
    {
        let db = app.state::<DbState>();
        let mut conn = db.conn.lock().unwrap_or_else(|e| e.into_inner());
        services::libraries::update_user_library(&mut conn, library_id, path)
            .map_err(|e| e.to_string())?;
    }
    refresh_asset_scope(&app)
}

#[tauri::command]
pub fn set_primary_library(db: State<'_, DbState>, library_id: i64) -> Result<(), String> {
    let mut conn = db.lock();
    services::libraries::set_primary_library(&mut conn, library_id).map_err(|e| e.to_string())
}
