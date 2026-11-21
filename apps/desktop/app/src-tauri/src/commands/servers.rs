use desktop_core::{
    db::{repository, DbState},
    models::servers::Server,
    servers::state::AppServers,
};
use tauri::State;

#[tauri::command]
pub fn get_servers(db: State<'_, DbState>) -> Result<Vec<Server>, String> {
    let conn = db.lock();
    repository::servers::get_all(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn switch_server(
    server_id: i64,
    servers: State<'_, AppServers>,
    db: State<'_, DbState>,
) -> Result<Server, String> {
    let mut conn = db.lock();
    servers.switch(&mut conn, server_id)
}
