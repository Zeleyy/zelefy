use std::{
    path::{Path, PathBuf},
    sync::atomic::{AtomicBool, Ordering},
};
use tauri::async_runtime::Mutex;

pub mod commands;
pub mod config;

pub use config::*;

const AUDIO_DIR: &str = "audio";
const IMAGE_DIR: &str = "image";
const WAVEFORM_DIR: &str = "waveform";
pub const DEFAULT_CACHE_LIMIT_MB: u32 = 1024;

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
    max_size_mb: Mutex<u32>,
    relocating: AtomicBool,
}

impl AppCache {
    pub fn init(default_root: PathBuf, config_path: PathBuf) -> Self {
        let cfg = load_config(&config_path);
        let active = cfg
            .audio_root
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
            configured_root: Mutex::new(cfg.audio_root),
            max_size_mb: Mutex::new(cfg.max_size_mb.unwrap_or(DEFAULT_CACHE_LIMIT_MB)),
            relocating: AtomicBool::new(false),
        }
    }

    pub fn cache_dirs(&self) -> CacheDirs {
        CacheDirs::under(&self.active_root())
    }

    fn update_config<F>(&self, f: F) -> Result<(), String>
    where
        F: FnOnce(&mut CacheConfig) -> Result<(), String>,
    {
        let _guard = self.config_lock.blocking_lock();
        let mut cfg = load_config(&self.config_path);
        f(&mut cfg)?;
        save_config(
            &self.config_path,
            cfg.audio_root.as_deref(),
            cfg.max_size_mb,
        )
        .map_err(|e| e.to_string())
    }

    pub fn active_root(&self) -> PathBuf {
        self.active_root.blocking_lock().clone()
    }

    pub fn set_root(&self, new_root: PathBuf) -> Result<PathBuf, String> {
        if !is_usable_root(&new_root) {
            return Err("Path is not usable".into());
        }

        if self.relocating.swap(true, Ordering::SeqCst) {
            return Err("Relocation already in progress".into());
        }

        let result = (|| {
            CacheDirs::under(&new_root)
                .create()
                .map_err(|e| e.to_string())?;
            self.update_config(|cfg| {
                cfg.audio_root = Some(new_root.clone());
                Ok(())
            })?;
            *self.active_root.blocking_lock() = new_root.clone();
            *self.configured_root.blocking_lock() = Some(new_root.clone());
            Ok(new_root)
        })();

        self.relocating.store(false, Ordering::SeqCst);
        result
    }

    pub fn default_root(&self) -> PathBuf {
        self.default_root.clone()
    }

    pub fn reset_root(&self) -> Result<PathBuf, String> {
        self.set_root(self.default_root.clone())
    }

    pub fn current_max_size_mb(&self) -> u32 {
        *self.max_size_mb.blocking_lock()
    }

    pub fn set_max_size_mb(&self, mb: u32) -> Result<u32, String> {
        self.update_config(|cfg| {
            cfg.max_size_mb = Some(mb);
            Ok(())
        })?;

        *self.max_size_mb.blocking_lock() = mb;
        Ok(mb)
    }

    pub fn reset_max_size(&self) -> Result<u32, String> {
        self.update_config(|cfg| {
            cfg.max_size_mb = None;
            Ok(())
        })?;

        *self.max_size_mb.blocking_lock() = DEFAULT_CACHE_LIMIT_MB;
        Ok(DEFAULT_CACHE_LIMIT_MB)
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
