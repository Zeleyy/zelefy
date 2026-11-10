use rodio::{
    Decoder, DeviceSinkBuilder, MixerDeviceSink, Player,
    cpal::{self, traits::HostTrait},
};
use serde::Serialize;
use std::{
    path::{Path, PathBuf},
    str::FromStr,
    sync::mpsc::{self, Receiver, RecvTimeoutError, Sender},
    thread,
    time::Duration,
};

use crate::audio::errors::EngineError;

pub enum Command {
    Load {
        path: PathBuf,
        autoplay: bool,
    },
    Play,
    Pause,
    Seek(f64),
    SetVolume(f32),
    Stop,
    Unload(Sender<()>),
    SwitchDevice {
        device_id: Option<String>,
        reply: Sender<Result<(), EngineError>>,
    },
}

fn open_sink(device_id: Option<&str>) -> Result<MixerDeviceSink, EngineError> {
    let mut handle = match device_id {
        None => DeviceSinkBuilder::open_default_sink()
            .map_err(|e| EngineError::OpenDevice(e.to_string())),
        Some(s) => {
            let id = cpal::DeviceId::from_str(s)
                .map_err(|e| EngineError::InvalidDeviceId(e.to_string()))?;
            let device = cpal::default_host()
                .device_by_id(&id)
                .ok_or_else(|| EngineError::DeviceNotFound(s.to_owned()))?;
            DeviceSinkBuilder::from_device(device)
                .and_then(|b| b.open_stream())
                .map_err(|e| EngineError::OpenDevice(e.to_string()))
        }
    }?;
    handle.log_on_drop(false);
    Ok(handle)
}

fn make_player(
    sink: &MixerDeviceSink,
    path: &Path,
    volume: f32,
    paused: bool,
) -> Result<Player, EngineError> {
    let file = std::fs::File::open(path)?;
    let source = Decoder::try_from(file).map_err(|e| EngineError::Decode(e.to_string()))?;

    let p = Player::connect_new(sink.mixer());
    p.set_volume(volume);
    if paused {
        p.pause();
    }
    p.append(source);
    Ok(p)
}

#[derive(Clone, Serialize)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum PlayerEvent {
    Position { seconds: f64 },
    Ended,
    Error { message: String },
}

#[derive(Clone)]
pub struct AudioEngine {
    tx: Sender<Command>,
}

impl AudioEngine {
    pub fn spawn(emit: impl Fn(PlayerEvent) + Send + 'static) -> Self {
        let (tx, rx) = mpsc::channel();
        thread::Builder::new()
            .name("audio-engine".into())
            .spawn(move || run(rx, emit))
            .expect("failed to spawn audio thread");
        Self { tx }
    }

    pub fn send(&self, cmd: Command) {
        let _ = self.tx.send(cmd);
    }
}

fn run(rx: Receiver<Command>, emit: impl Fn(PlayerEvent)) {
    let mut device = match open_sink(None) {
        Ok(d) => d,
        Err(e) => {
            emit(PlayerEvent::Error {
                message: e.to_string(),
            });
            return;
        }
    };
    let mut player: Option<Player> = None;
    let mut current_path: Option<PathBuf> = None;

    let mut volume = 1.0_f32;
    let mut ended_sent = true;

    loop {
        match rx.recv_timeout(Duration::from_millis(200)) {
            Ok(Command::Load { path, autoplay }) => {
                player = None;
                match make_player(&device, &path, volume, !autoplay) {
                    Ok(p) => {
                        player = Some(p);
                        current_path = Some(path);
                        ended_sent = false;
                    }
                    Err(message) => {
                        current_path = None;
                        emit(PlayerEvent::Error {
                            message: message.to_string(),
                        });
                    }
                }
            }
            Ok(Command::Play) => {
                if let Some(p) = &player {
                    p.play();
                }
            }
            Ok(Command::Pause) => {
                if let Some(p) = &player {
                    p.pause();
                }
            }
            Ok(Command::Seek(secs)) => {
                if let Some(p) = &player {
                    if let Err(e) = p.try_seek(Duration::from_secs_f64(secs.max(0.0))) {
                        emit(PlayerEvent::Error {
                            message: e.to_string(),
                        });
                    }
                }
            }
            Ok(Command::SetVolume(v)) => {
                volume = v.clamp(0.0, 1.0);
                if let Some(p) = &player {
                    p.set_volume(volume);
                }
            }
            Ok(Command::Stop) => {
                player = None;
                current_path = None;
                ended_sent = true;
            }
            Ok(Command::Unload(ack)) => {
                player = None;
                current_path = None;
                ended_sent = true;
                let _ = ack.send(());
            }
            Ok(Command::SwitchDevice { device_id, reply }) => {
                let result = open_sink(device_id.as_deref()).and_then(|new_sink| {
                    let snapshot = player
                        .as_ref()
                        .filter(|p| !p.empty())
                        .map(|p| (p.get_pos(), p.is_paused()));

                    let new_player = match (snapshot, current_path.as_ref()) {
                        (Some((pos, paused)), Some(path)) => {
                            let p = make_player(&new_sink, path, volume, true)?;
                            if let Err(e) = p.try_seek(pos) {
                                emit(PlayerEvent::Error {
                                    message: EngineError::Seek(e.to_string()).to_string(),
                                });
                            }
                            if !paused {
                                p.play();
                            }
                            Some(p)
                        }
                        _ => None,
                    };

                    if new_player.is_none()
                        && !ended_sent
                        && player.as_ref().is_some_and(|p| p.empty())
                    {
                        ended_sent = true;
                        emit(PlayerEvent::Ended);
                    }
                    player = new_player;
                    device = new_sink;
                    Ok(())
                });
                let _ = reply.send(result);
            }
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => break,
        }

        if let Some(p) = &player {
            if p.empty() {
                if !ended_sent {
                    ended_sent = true;
                    emit(PlayerEvent::Ended);
                }
            } else if !p.is_paused() {
                emit(PlayerEvent::Position {
                    seconds: p.get_pos().as_secs_f64(),
                });
            }
        }
    }
}
