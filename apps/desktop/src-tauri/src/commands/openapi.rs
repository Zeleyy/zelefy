use desktop_core::constants::openapi::{get_spec_or_default, ApiService};
use serde::Serialize;
use tauri::{AppHandle, Manager};

#[derive(Serialize, Clone)]
pub struct ApiEndpointInfo {
    pub path: String,
    pub method: String,
}

#[tauri::command]
pub fn get_available_endpoints(
    app_handle: AppHandle,
    service: ApiService,
) -> Result<Vec<ApiEndpointInfo>, String> {
    let app_dir = app_handle
        .clone()
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    let file_path = app_dir.join("openapi").join(service.filename());

    let spec_content = get_spec_or_default(&file_path, service).map_err(|e| e.to_string())?;

    let json: serde_json::Value = serde_json::from_str(&spec_content)
        .map_err(|e| format!("Failed to parse OpenAPI JSON: {}", e))?;

    let mut endpoints = Vec::new();

    if let Some(paths) = json.get("paths").and_then(|v| v.as_object()) {
        for (path, methods) in paths {
            if let Some(method_obj) = methods.as_object() {
                for method in method_obj.keys() {
                    let method_upper = method.to_uppercase();
                    if matches!(
                        method_upper.as_str(),
                        "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS"
                    ) {
                        endpoints.push(ApiEndpointInfo {
                            path: path.clone(),
                            method: method_upper,
                        });
                    }
                }
            }
        }
    }

    Ok(endpoints)
}
