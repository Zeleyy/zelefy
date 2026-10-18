pub mod commands;
pub mod state;

use desktop_core::db::{init_db, DbState};
use state::AppState;
use tauri::Manager;

use crate::state::cache::AppCache;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let data_root = app
                .path()
                .app_data_dir()
                .expect("Failed to get app_data_dir");
            let local_root = app
                .path()
                .app_local_data_dir()
                .expect("Failed to get app_local_data_dir");
            let config_root = app
                .path()
                .app_config_dir()
                .expect("Failed to get app_config_dir");

            std::fs::create_dir_all(&data_root).expect("Failed to create app_data_dir");
            std::fs::create_dir_all(&local_root).expect("Failed to create app_local_data_dir");
            std::fs::create_dir_all(&config_root).expect("Failed to create app_config_dir");

            let cache = AppCache::init(local_root.join("cache"), config_root.join("cache.json"));
            let db_path = data_root.join("zelefy.db");
            let conn = init_db(&db_path.to_string_lossy()).expect("Failed to initialize database");

            app.manage(cache);
            app.manage(DbState::new(conn));
            app.manage(AppState::default());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_gateway_url,
            commands::set_gateway_url,
            commands::reset_gateway_url,
            commands::get_default_gateway_url,
            commands::get_available_services,
            commands::get_available_endpoints,
            commands::get_all_storages,
            commands::add_user_library,
            state::cache::commands::get_cache_root,
            state::cache::commands::set_cache_root,
            state::cache::commands::get_default_cache_root,
            state::cache::commands::reset_cache_root,
            state::cache::commands::get_cache_limit,
            state::cache::commands::set_cache_limit,
            state::cache::commands::get_default_cache_limit,
            state::cache::commands::reset_cache_limit,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
