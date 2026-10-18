use tauri::State;

use crate::state::{AppState, DEFAULT_GATEWAY_URL};

#[tauri::command]
pub fn get_default_gateway_url() -> &'static str {
    DEFAULT_GATEWAY_URL
}

#[tauri::command]
pub fn get_gateway_url(state: State<'_, AppState>) -> String {
    let url = state.gateway_url.blocking_lock();
    url.clone()
}

#[tauri::command]
pub fn set_gateway_url(state: State<'_, AppState>, new_url: String) -> Result<(), String> {
    let mut url = state.gateway_url.blocking_lock();
    *url = new_url.clone();
    Ok(())
}

#[tauri::command]
pub fn reset_gateway_url(state: State<'_, AppState>) -> String {
    let mut url = state.gateway_url.blocking_lock();
    *url = DEFAULT_GATEWAY_URL.to_string();
    url.clone()
}
