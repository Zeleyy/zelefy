use rusqlite::Row;
use serde::Serialize;

use crate::models::files::FileType;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackFile {
    pub track_id: i64,
    pub file_id: i64,
    pub file_type: FileType,
}

impl TrackFile {
    pub fn from_row(row: &Row<'_>) -> rusqlite::Result<Self> {
        Ok(Self {
            track_id: row.get("track_id")?,
            file_id: row.get("file_id")?,
            file_type: row.get("file_type_id")?,
        })
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackFileWithPath {
    #[serde(flatten)]
    pub track_file: TrackFile,
    pub library_id: Option<i64>,
    pub is_link: bool,
    pub size_bytes: i64,
    pub full_path: String,
}

impl TrackFileWithPath {
    pub fn from_row(row: &Row<'_>) -> rusqlite::Result<Self> {
        Ok(Self {
            track_file: TrackFile::from_row(row)?,
            library_id: row.get("library_id")?,
            is_link: row.get("is_link")?,
            size_bytes: row.get("size_bytes")?,
            full_path: row.get("full_path")?,
        })
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackFilesWithPath {
    pub audio: Option<TrackFileWithPath>,
    pub image: Option<TrackFileWithPath>,
    pub waveform: Option<TrackFileWithPath>,
}

impl TrackFilesWithPath {
    pub fn from_rows(mut rows: Vec<TrackFileWithPath>) -> Self {
        let mut audio = None;
        let mut image = None;
        let mut waveform = None;

        for tf in rows.drain(..) {
            match tf.track_file.file_type {
                FileType::Audio => audio = Some(tf),
                FileType::Image => image = Some(tf),
                FileType::Waveform => waveform = Some(tf),
            }
        }

        Self {
            audio,
            image,
            waveform,
        }
    }
}

#[derive(Debug)]
pub struct NewTrackFile {
    pub track_id: i64,
    pub file_id: i64,
    pub file_type: FileType,
}
