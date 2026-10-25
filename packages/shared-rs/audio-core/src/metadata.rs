use lofty::{
    file::{AudioFile, TaggedFileExt},
    picture::PictureType,
    probe::Probe,
    tag::Accessor,
};
use std::io::{BufReader, Cursor, Read, Seek};

use crate::errors::AudioError;

#[derive(Debug, Clone, Default)]
pub struct AudioMetadata {
    pub duration_secs: f32,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub genre: Option<String>,
    pub cover: Option<CoverArt>,
}

#[derive(Debug, Clone)]
pub struct CoverArt {
    pub mime: Option<String>,
    pub data: Vec<u8>,
}

pub fn read_metadata<R: Read + Seek>(reader: R) -> Result<AudioMetadata, AudioError> {
    let file = Probe::new(BufReader::new(reader))
        .guess_file_type()
        .map_err(|_| AudioError::Metadata)?
        .read()
        .map_err(|_| AudioError::Metadata)?;

    let tag = file.primary_tag().or_else(|| file.first_tag());

    let cover = tag
        .and_then(|t| {
            t.get_picture_type(PictureType::CoverFront)
                .or_else(|| t.pictures().first())
        })
        .map(|p| CoverArt {
            mime: p.mime_type().map(|m| m.as_str().to_string()),
            data: p.data().to_vec(),
        });

    Ok(AudioMetadata {
        duration_secs: file.properties().duration().as_secs_f32(),
        title: tag.and_then(|t| t.title()).map(|s| s.into_owned()),
        artist: tag.and_then(|t| t.artist()).map(|s| s.into_owned()),
        album: tag.and_then(|t| t.album()).map(|s| s.into_owned()),
        genre: tag.and_then(|t| t.genre()).map(|s| s.into_owned()),
        cover,
    })
}

pub fn read_metadata_from_bytes(bytes: &[u8]) -> Result<AudioMetadata, AudioError> {
    read_metadata(Cursor::new(bytes))
}

pub fn cover_ext(c: &CoverArt) -> &'static str {
    match c.mime.as_deref() {
        Some("image/png") => "png",
        Some("image/webp") => "webp",
        Some("image/gif") => "gif",
        _ => "jpg",
    }
}
