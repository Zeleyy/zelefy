use std::path::Path;

use include_dir::{Dir, include_dir};

pub static OPENAPI_SPECS: Dir<'static> = include_dir!("$CARGO_MANIFEST_DIR/assets/openapi");

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ApiService {
    Profiles,
    Tracks,
}

impl ApiService {
    pub fn filename(&self) -> &'static str {
        match self {
            ApiService::Profiles => "profiles.json",
            ApiService::Tracks => "tracks.json",
        }
    }
}

pub fn get_spec_or_default(
    app_data_file_path: &Path,
    service: ApiService,
) -> Result<String, Box<dyn std::error::Error>> {
    if app_data_file_path.exists() {
        let content = std::fs::read_to_string(app_data_file_path)?;
        return Ok(content);
    }

    let filename = service.filename();
    let file = OPENAPI_SPECS
        .get_file(filename)
        .ok_or_else(|| format!("Embedded spec not found for {:?}", service))?;

    let content_str = file
        .contents_utf8()
        .ok_or_else(|| format!("Failed to read embedded spec as string for {:?}", service))?;

    if let Some(parent) = app_data_file_path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(app_data_file_path, content_str)?;

    Ok(content_str.to_string())
}
