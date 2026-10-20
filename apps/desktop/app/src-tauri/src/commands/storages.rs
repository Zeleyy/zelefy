use desktop_core::{
    db::{repository, DbState},
    models::storages::StorageWithStats,
    services,
};
use tauri::State;

#[tauri::command]
pub fn get_all_storages(db: State<'_, DbState>) -> Result<Vec<StorageWithStats>, String> {
    let conn = db.conn.lock().unwrap_or_else(|e| e.into_inner());
    let storages = repository::storages::get_all(&conn)
        .map_err(|e| format!("Ошибка получения локальных хранилищ: {}", e).to_string())?;

    let storages_with_stats = storages
        .iter()
        .map(|storage| StorageWithStats {
            storage: storage.to_owned(),
            used_size_bytes: 0,
            files_count: 0,
        })
        .collect();

    Ok(storages_with_stats)
}

#[tauri::command]
pub fn add_user_library(db: State<'_, DbState>, path: String) -> Result<i64, String> {
    let mut conn = db.conn.lock().unwrap_or_else(|e| e.into_inner());
    services::storages::create_user_library(&mut conn, path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_user_library(
    db: State<'_, DbState>,
    storage_id: i64,
    path: String,
) -> Result<(), String> {
    let mut conn = db.conn.lock().unwrap_or_else(|e| e.into_inner());
    services::storages::update_user_library(&mut conn, storage_id, path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_primary_library(db: State<'_, DbState>, storage_id: i64) -> Result<(), String> {
    let mut conn = db.conn.lock().unwrap_or_else(|e| e.into_inner());
    services::storages::set_primary_library(&mut conn, storage_id).map_err(|e| e.to_string())
}
