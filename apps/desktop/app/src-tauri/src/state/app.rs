use tauri::async_runtime::Mutex;

pub const DEFAULT_SERVER_URL: &str = "api.zelefy.zeleyy.com";

pub struct AppState {
    pub gateway_url: Mutex<String>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            gateway_url: Mutex::new(DEFAULT_SERVER_URL.to_string()),
        }
    }
}
