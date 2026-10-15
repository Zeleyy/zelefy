pub mod commands;
pub mod state;

use desktop_core::db::{init_db, DbState};
use state::AppState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app_data_dir");

            if !app_dir.exists() {
                std::fs::create_dir_all(&app_dir).expect("Failed to create app_data_dir");
            }

            let db_path = app_dir.join("zelefy.db");
            let conn = init_db(&db_path.to_string_lossy()).expect("Failed to initialize database");

            app.manage(DbState::new(conn));
            app.manage(AppState::default());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_gateway_url,
            commands::set_gateway_url,
            commands::reset_gateway_url,
            commands::get_default_gateway_url,
            commands::get_cache_limit,
            commands::set_cache_limit,
            commands::get_available_services,
            commands::get_available_endpoints,
            commands::create_storage,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
