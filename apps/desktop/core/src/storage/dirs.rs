use std::path::{Path, PathBuf};

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
