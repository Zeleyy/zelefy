use std::path::{Path, PathBuf};

use uuid::Uuid;

const AUDIO_DIR: &str = "audio";
const IMAGE_DIR: &str = "image";
const WAVEFORM_DIR: &str = "waveform";

pub struct DataDirs {
    pub audio: PathBuf,
    pub image: PathBuf,
    pub waveform: PathBuf,
}

impl DataDirs {
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

    pub fn create(&self) -> std::io::Result<()> {
        for dir in self.all() {
            std::fs::create_dir_all(dir)?;
        }
        Ok(())
    }
}

fn sharded(dir: &str, id: Uuid, ext: &str) -> PathBuf {
    let name = id.simple().to_string();
    PathBuf::from(dir)
        .join(&name[..2])
        .join(format!("{name}.{ext}"))
}

pub fn audio_rel_path(id: Uuid, ext: &str) -> PathBuf {
    sharded(AUDIO_DIR, id, ext)
}

pub fn image_rel_path(id: Uuid, ext: &str) -> PathBuf {
    sharded(IMAGE_DIR, id, ext)
}

pub fn waveform_rel_path(id: Uuid, ext: &str) -> PathBuf {
    sharded(WAVEFORM_DIR, id, ext)
}

pub fn to_db_path(rel: &Path) -> String {
    rel.to_string_lossy().replace('\\', "/")
}
