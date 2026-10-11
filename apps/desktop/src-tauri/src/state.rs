use tauri::async_runtime::Mutex;

pub struct AppState {
    pub gateway_url: Mutex<String>,
    pub cache_limit_mb: Mutex<u32>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            gateway_url: Mutex::new("https://api.zelefy.com".to_string()),
            cache_limit_mb: Mutex::new(1024),
        }
    }
}
