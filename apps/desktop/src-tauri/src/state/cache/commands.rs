use std::path::PathBuf;

use crate::state::cache::AppCache;

#[tauri::command]
pub fn get_cache_root(cache: tauri::State<'_, AppCache>) -> String {
    cache.active_root().to_string_lossy().to_string()
}

#[tauri::command]
pub fn set_cache_root(path: String, cache: tauri::State<'_, AppCache>) -> Result<(), String> {
    cache.set_root(PathBuf::from(path))
}

#[tauri::command]
pub fn get_default_cache_root(cache: tauri::State<'_, AppCache>) -> String {
    cache.default_root().to_string_lossy().to_string()
}

#[tauri::command]
pub fn reset_cache_root(cache: tauri::State<'_, AppCache>) -> Result<(), String> {
    cache.reset_root()
}
