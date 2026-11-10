#[derive(Debug, thiserror::Error)]
pub enum EngineError {
    #[error("invalid device id: {0}")]
    InvalidDeviceId(String),

    #[error("device not found: {0}")]
    DeviceNotFound(String),

    #[error("failed to open output device: {0}")]
    OpenDevice(String),

    #[error("failed to open file: {0}")]
    Io(#[from] std::io::Error),

    #[error("failed to decode audio: {0}")]
    Decode(String),

    #[error("seek failed: {0}")]
    Seek(String),

    #[error("audio device error: {0}")]
    AudioDevice(rodio::CpalError),
}
