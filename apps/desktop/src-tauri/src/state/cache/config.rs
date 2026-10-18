use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default)]
pub struct CacheConfig {
    #[serde(default)]
    pub audio_root: Option<PathBuf>,
    #[serde(default)]
    pub max_size_mb: Option<u32>,
}

pub fn load_config(config_path: &Path) -> CacheConfig {
    std::fs::read_to_string(config_path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

pub fn save_config(
    config_path: &Path,
    root: Option<&Path>,
    max_size_mb: Option<u32>,
) -> std::io::Result<()> {
    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let config = CacheConfig {
        audio_root: root.map(|p| p.to_path_buf()),
        max_size_mb,
    };
    let json = serde_json::to_string_pretty(&config)?;
    std::fs::write(config_path, json)
}
