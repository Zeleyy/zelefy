use std::path::PathBuf;

use tauri::State;

use crate::state::cache::{AppCache, DEFAULT_CACHE_LIMIT_MB};

#[tauri::command]
pub fn get_cache_root(cache: tauri::State<'_, AppCache>) -> String {
    cache.active_root().to_string_lossy().to_string()
}

#[tauri::command]
pub fn set_cache_root(path: String, cache: State<'_, AppCache>) -> Result<String, String> {
    cache
        .set_root(PathBuf::from(path))
        .map(|p| p.to_string_lossy().to_string())
}

#[tauri::command]
pub fn get_default_cache_root(cache: State<'_, AppCache>) -> String {
    cache.default_root().to_string_lossy().to_string()
}

#[tauri::command]
pub fn reset_cache_root(cache: State<'_, AppCache>) -> Result<String, String> {
    cache.reset_root().map(|p| p.to_string_lossy().to_string())
}

#[tauri::command]
pub fn get_cache_limit(cache: State<'_, AppCache>) -> u32 {
    cache.current_max_size_mb()
}

#[tauri::command]
pub fn set_cache_limit(cache: State<'_, AppCache>, limit_mb: u32) -> Result<u32, String> {
    cache.set_max_size_mb(limit_mb)
}

#[tauri::command]
pub fn get_default_cache_limit() -> u32 {
    DEFAULT_CACHE_LIMIT_MB
}

#[tauri::command]
pub fn reset_cache_limit(cache: State<'_, AppCache>) -> Result<u32, String> {
    cache.reset_max_size()
}
