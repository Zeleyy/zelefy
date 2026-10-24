use desktop_core::db::{init_db, DbState};
use state::AppState;
use tauri::Manager;

pub mod cache;
pub mod commands;
pub mod state;

use crate::{cache::AppCache, commands::refresh_asset_scope};

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

            if let Err(e) = refresh_asset_scope(app.handle()) {
                eprintln!("asset scope: {e}");
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_gateway_url,
            commands::set_gateway_url,
            commands::reset_gateway_url,
            commands::get_default_gateway_url,
            commands::get_available_services,
            commands::get_available_endpoints,
            commands::get_all_libraries,
            commands::add_user_library,
            commands::update_user_library,
            commands::set_primary_library,
            cache::commands::get_cache_root,
            cache::commands::set_cache_root,
            cache::commands::get_default_cache_root,
            cache::commands::reset_cache_root,
            cache::commands::get_cache_limit,
            cache::commands::set_cache_limit,
            cache::commands::get_default_cache_limit,
            cache::commands::reset_cache_limit,
            commands::import_tracks,
            commands::get_local_tracks,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
