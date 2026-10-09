use desktop_core::db::init_db;
use std::sync::Mutex;
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

            app.manage(Mutex::new(conn));

            Ok(())
        })
        // .invoke_handler()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
