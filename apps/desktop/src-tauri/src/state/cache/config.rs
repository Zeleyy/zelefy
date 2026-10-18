use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default)]
pub struct CacheConfig {
    #[serde(default)]
    audio_root: Option<PathBuf>,
}

pub fn load_configured_root(config_path: &Path) -> Option<PathBuf> {
    let content = std::fs::read_to_string(config_path).ok()?;
    let config: CacheConfig = serde_json::from_str(&content).ok()?;
    config.audio_root
}

pub fn save_configured_root(config_path: &Path, root: Option<&Path>) -> std::io::Result<()> {
    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let config = CacheConfig {
        audio_root: root.map(|p| p.to_path_buf()),
    };
    let json = serde_json::to_string_pretty(&config)?;
    std::fs::write(config_path, json)
}
