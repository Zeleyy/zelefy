use desktop_core::{db::DbState, models::storages::NewStorage, services};
use tauri::State;

#[tauri::command]
pub fn create_storage(db: State<'_, DbState>, new_storage: NewStorage) -> Result<i64, String> {
    let conn = db.conn.lock().unwrap_or_else(|e| e.into_inner());
    services::storages::create(&conn, new_storage).map_err(|e| e.to_string())
}
