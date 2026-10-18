use tauri::async_runtime::Mutex;

pub const DEFAULT_GATEWAY_URL: &str = "https://api.zelefy.com";

pub struct AppState {
    pub gateway_url: Mutex<String>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            gateway_url: Mutex::new(DEFAULT_GATEWAY_URL.to_string()),
        }
    }
}
