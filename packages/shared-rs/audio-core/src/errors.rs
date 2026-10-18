use symphonia::core::errors::Error as SymphoniaError;

#[derive(Debug, thiserror::Error)]
pub enum AudioError {
    #[error("Ошибка декодирования или ввода-вывода: {0}")]
    Symphonia(#[from] SymphoniaError),
    #[error("Аудиопоток не найден в файле")]
    NoAudioTrack,
    #[error("Неподдерживаемый формат аудио буфера")]
    UnsupportedBuffer,
}
