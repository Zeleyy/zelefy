use tauri::async_runtime::Mutex;

pub const DEFAULT_GATEWAY_URL: &str = "https://api.zelefy.com";
pub const DEFAULT_CACHE_LIMIT_MB: u32 = 1024;

pub struct AppState {
    pub gateway_url: Mutex<String>,
    pub cache_limit_mb: Mutex<u32>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            gateway_url: Mutex::new(DEFAULT_GATEWAY_URL.to_string()),
            cache_limit_mb: Mutex::new(DEFAULT_CACHE_LIMIT_MB),
        }
    }
}
