use rodio::{Decoder, DeviceSinkBuilder, Player};
use serde::Serialize;
use std::{
    path::PathBuf,
    sync::mpsc::{self, Receiver, RecvTimeoutError, Sender},
    thread,
    time::Duration,
};

pub enum Command {
    Load { path: PathBuf, autoplay: bool },
    Play,
    Pause,
    Seek(f64),
    SetVolume(f32),
    Stop,
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
    let device = match DeviceSinkBuilder::open_default_sink() {
        Ok(d) => d,
        Err(e) => {
            emit(PlayerEvent::Error {
                message: e.to_string(),
            });
            return;
        }
    };

    let mut player: Option<Player> = None;
    let mut volume = 1.0_f32;
    let mut ended_sent = true;

    loop {
        match rx.recv_timeout(Duration::from_millis(200)) {
            Ok(Command::Load { path, autoplay }) => {
                player = None;

                let source = std::fs::File::open(&path)
                    .map_err(|e| e.to_string())
                    .and_then(|f| Decoder::try_from(f).map_err(|e| e.to_string()));

                match source {
                    Ok(source) => {
                        let p = Player::connect_new(device.mixer());
                        p.set_volume(volume);
                        if !autoplay {
                            p.pause();
                        }
                        p.append(source);
                        player = Some(p);
                        ended_sent = false;
                    }
                    Err(message) => emit(PlayerEvent::Error { message }),
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
                ended_sent = true;
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
