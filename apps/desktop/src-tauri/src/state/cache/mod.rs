use std::{
    path::{Path, PathBuf},
    sync::atomic::AtomicBool,
};
use tauri::async_runtime::Mutex;

pub mod commands;
pub mod config;

pub use config::*;

const AUDIO_DIR: &str = "audio";
const IMAGE_DIR: &str = "image";
const WAVEFORM_DIR: &str = "waveform";

pub struct CacheDirs {
    pub audio: PathBuf,
    pub image: PathBuf,
    pub waveform: PathBuf,
}

impl CacheDirs {
    pub fn under(root: &Path) -> Self {
        Self {
            audio: root.join(AUDIO_DIR),
            image: root.join(IMAGE_DIR),
            waveform: root.join(WAVEFORM_DIR),
        }
    }

    fn all(&self) -> [&PathBuf; 3] {
        [&self.audio, &self.image, &self.waveform]
    }

    fn create(&self) -> std::io::Result<()> {
        for dir in self.all() {
            std::fs::create_dir_all(dir)?;
        }
        Ok(())
    }
}

pub struct AppCache {
    config_path: PathBuf,
    config_lock: Mutex<()>,
    default_root: PathBuf,
    active_root: Mutex<PathBuf>,
    configured_root: Mutex<Option<PathBuf>>,
    relocating: AtomicBool,
}

impl AppCache {
    pub fn init(default_root: PathBuf, config_path: PathBuf) -> Self {
        let configured = load_configured_root(&config_path);
        let active = configured
            .as_ref()
            .filter(|p| is_usable_root(p))
            .cloned()
            .unwrap_or_else(|| default_root.clone());

        CacheDirs::under(&active).create().ok();

        Self {
            config_path,
            config_lock: Mutex::new(()),
            default_root,
            active_root: Mutex::new(active),
            configured_root: Mutex::new(configured),
            relocating: AtomicBool::new(false),
        }
    }

    pub fn active_root(&self) -> PathBuf {
        self.active_root.blocking_lock().clone()
    }

    pub fn cache_dirs(&self) -> CacheDirs {
        CacheDirs::under(&self.active_root())
    }

    pub fn set_root(&self, new_root: PathBuf) -> Result<(), String> {
        if !is_usable_root(&new_root) {
            return Err("Path is not usable".into());
        }

        if self
            .relocating
            .swap(true, std::sync::atomic::Ordering::SeqCst)
        {
            return Err("Relocation already in progress".into());
        }

        let result = (|| -> Result<(), String> {
            CacheDirs::under(&new_root)
                .create()
                .map_err(|e| e.to_string())?;

            *self.active_root.blocking_lock() = new_root.clone();
            *self.configured_root.blocking_lock() = Some(new_root.clone());

            let _guard = self.config_lock.blocking_lock();
            save_configured_root(&self.config_path, Some(&new_root)).map_err(|e| e.to_string())?;

            Ok(())
        })();

        self.relocating
            .store(false, std::sync::atomic::Ordering::SeqCst);
        result
    }

    pub fn default_root(&self) -> PathBuf {
        self.default_root.clone()
    }

    pub fn reset_root(&self) -> Result<(), String> {
        self.set_root(self.default_root.clone())
    }
}

fn is_usable_root(path: &Path) -> bool {
    if !path.is_dir() {
        return false;
    }
    let probe = path.join(".write_probe");
    match std::fs::write(&probe, b"") {
        Ok(_) => {
            let _ = std::fs::remove_file(&probe);
            true
        }
        Err(_) => false,
    }
}
