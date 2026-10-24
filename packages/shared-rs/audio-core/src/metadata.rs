use lofty::{
    file::{AudioFile, TaggedFileExt},
    probe::Probe,
    tag::Accessor,
};
use std::io::{BufReader, Cursor, Read, Seek};

use crate::errors::AudioError;

#[derive(Debug, Clone, Default)]
pub struct AudioMetadata {
    pub duration_secs: Option<f32>,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub genre: Option<String>,
}

pub fn read_metadata<R: Read + Seek>(reader: R) -> Result<AudioMetadata, AudioError> {
    let file = Probe::new(BufReader::new(reader))
        .guess_file_type()
        .map_err(|_| AudioError::Metadata)?
        .read()
        .map_err(|_| AudioError::Metadata)?;

    let tag = file.primary_tag().or_else(|| file.first_tag());

    Ok(AudioMetadata {
        duration_secs: Some(file.properties().duration().as_secs_f32()),
        title: tag.and_then(|t| t.title()).map(|s| s.into_owned()),
        artist: tag.and_then(|t| t.artist()).map(|s| s.into_owned()),
        album: tag.and_then(|t| t.album()).map(|s| s.into_owned()),
        genre: tag.and_then(|t| t.genre()).map(|s| s.into_owned()),
    })
}

pub fn read_metadata_from_bytes(bytes: &[u8]) -> Result<AudioMetadata, AudioError> {
    read_metadata(Cursor::new(bytes))
}
