use desktop_core::{
    db::{repository, DbState},
    models::servers::{NewServer, Server},
    servers::state::{AppServers, DEFAULT_SERVER_URL},
};
use tauri::State;

#[tauri::command]
pub fn get_active_server(servers: State<'_, AppServers>) -> Server {
    servers.active()
}

#[tauri::command]
pub fn get_default_server_url() -> String {
    DEFAULT_SERVER_URL.to_string()
}

#[tauri::command]
pub fn get_servers(db: State<'_, DbState>) -> Result<Vec<Server>, String> {
    let conn = db.lock();
    repository::servers::get_all(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn switch_server(
    servers: State<'_, AppServers>,
    db: State<'_, DbState>,
    server_id: i64,
) -> Result<Server, String> {
    let mut conn = db.lock();
    servers
        .switch(&mut conn, server_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_server(db: State<'_, DbState>, new_server: NewServer) -> Result<i64, String> {
    let conn = db.lock();
    repository::servers::create(&conn, new_server).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn reset_server(
    servers: State<'_, AppServers>,
    db: State<'_, DbState>,
) -> Result<Server, String> {
    let mut conn = db.lock();
    servers.reset(&mut conn).map_err(|e| e.to_string())
}
