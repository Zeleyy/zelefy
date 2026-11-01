use std::{path::PathBuf, sync::Mutex};

use crate::services::errors::CoreError;

use super::{
    devices::{self, AudioSink},
    engine::{AudioEngine, Command, PlayerEvent},
};

pub struct AudioState {
    engine: AudioEngine,
    active_output: Mutex<Option<String>>,
}

impl AudioState {
    pub fn new(emit: impl Fn(PlayerEvent) + Send + 'static) -> Self {
        Self {
            engine: AudioEngine::spawn(emit),
            active_output: Mutex::new(None),
        }
    }

    pub fn load(&self, path: PathBuf, autoplay: bool) {
        self.engine.send(Command::Load { path, autoplay });
    }
    pub fn play(&self) {
        self.engine.send(Command::Play);
    }
    pub fn pause(&self) {
        self.engine.send(Command::Pause);
    }
    pub fn stop(&self) {
        self.engine.send(Command::Stop);
    }
    pub fn seek(&self, seconds: f64) {
        self.engine.send(Command::Seek(seconds));
    }
    pub fn set_volume(&self, volume: f32) {
        self.engine.send(Command::SetVolume(volume));
    }

    pub fn active_output(&self) -> Option<String> {
        self.active_output
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .clone()
    }

    pub fn list_output_devices(&self) -> Result<Vec<AudioSink>, CoreError> {
        devices::get_list_output_devices(self.active_output().as_deref())
    }
}
