use rodio::cpal::{self, DeviceId, traits::HostTrait};
use std::{
    path::PathBuf,
    sync::{Mutex, mpsc},
    time::Duration,
};

use crate::services::errors::CoreError;

use super::{
    devices::{self, AudioSink, resolve_device_id},
    engine::{AudioEngine, Command, PlayerEvent},
    errors::EngineError,
};

pub struct AudioState {
    engine: AudioEngine,
    active_output: Mutex<Option<DeviceId>>,
    switch_lock: Mutex<()>,
}

impl AudioState {
    pub fn new(emit: impl Fn(PlayerEvent) + Send + 'static) -> Self {
        Self {
            engine: AudioEngine::spawn(emit),
            active_output: Mutex::new(None),
            switch_lock: Mutex::new(()),
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
    pub fn unload(&self) {
        let (tx, rx) = mpsc::channel();
        self.engine.send(Command::Unload(tx));
        let _ = rx.recv_timeout(Duration::from_millis(500));
    }

    pub fn active_output(&self) -> Option<DeviceId> {
        self.active_output
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .clone()
    }

    pub fn list_output_devices(&self) -> Result<Vec<AudioSink>, EngineError> {
        devices::get_list_output_devices(self.active_output())
    }

    pub fn switch_device(&self, device_id: Option<String>) -> Result<(), CoreError> {
        let parsed = resolve_device_id(device_id.clone())?;
        if let Some(id) = &parsed {
            if cpal::default_host().device_by_id(id).is_none() {
                return Err(EngineError::DeviceNotFound(id.to_string()).into());
            }
        }

        let _guard = self.switch_lock.lock().unwrap_or_else(|e| e.into_inner());

        let (tx, rx) = mpsc::channel();
        self.engine.send(Command::SwitchDevice {
            device_id,
            reply: tx,
        });
        rx.recv_timeout(Duration::from_secs(3))
            .map_err(|e| match e {
                mpsc::RecvTimeoutError::Timeout => CoreError::EngineTimeout,
                mpsc::RecvTimeoutError::Disconnected => CoreError::EngineUnavailable,
            })??;

        *self.active_output.lock().unwrap_or_else(|e| e.into_inner()) = parsed;
        Ok(())
    }
}
