use desktop_core::storage::{resolve_data_root, DataDirs};
use std::{
    path::{Path, PathBuf},
    sync::atomic::{AtomicBool, Ordering},
};
use tauri::async_runtime::Mutex;

use crate::cache::{load_config, save_config, CacheConfig};

pub const DEFAULT_CACHE_LIMIT_MB: u32 = 1024;

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

        DataDirs::under(&active).create().ok();

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

    pub fn cache_dirs(&self) -> DataDirs {
        DataDirs::under(&self.active_root())
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

    pub fn set_root(&self, chosen: PathBuf) -> Result<PathBuf, String> {
        let new_root = resolve_data_root(&chosen, "cache");
        std::fs::create_dir_all(&new_root).map_err(|e| format!("Cannot create cache root: {e}"))?;
        self.apply_root(new_root)
    }

    pub fn default_root(&self) -> PathBuf {
        self.default_root.clone()
    }

    pub fn reset_root(&self) -> Result<PathBuf, String> {
        self.apply_root(self.default_root.clone())
    }

    fn apply_root(&self, new_root: PathBuf) -> Result<PathBuf, String> {
        if !is_usable_root(&new_root) {
            return Err("Path is not usable".into());
        }

        if self.relocating.swap(true, Ordering::SeqCst) {
            return Err("Relocation already in progress".into());
        }

        let result = (|| {
            DataDirs::under(&new_root)
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

fn is_usable_root(root: &Path) -> bool {
    root.is_dir() && probe_writable(root)
}

fn probe_writable(root: &Path) -> bool {
    let probe = root.join(".write_probe");
    let ok = std::fs::write(&probe, b"ok").is_ok();
    let _ = std::fs::remove_file(&probe);
    ok
}
