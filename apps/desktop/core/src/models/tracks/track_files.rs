use chrono::{DateTime, Utc};
use rusqlite::{
    Row, ToSql,
    types::{FromSql, FromSqlError, ToSqlOutput},
};
use serde::{Deserialize, Serialize};

use crate::models::libraries::Library;

#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TrackFileType {
    Audio = 0,
    Cover = 1,
    Waveform = 2,
}

impl ToSql for TrackFileType {
    fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
        Ok(ToSqlOutput::from(*self as u8))
    }
}

impl FromSql for TrackFileType {
    fn column_result(value: rusqlite::types::ValueRef<'_>) -> rusqlite::types::FromSqlResult<Self> {
        let int_val = u8::column_result(value)?;
        match int_val {
            0 => Ok(TrackFileType::Audio),
            1 => Ok(TrackFileType::Cover),
            2 => Ok(TrackFileType::Waveform),
            other => Err(FromSqlError::OutOfRange(other as i64)),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackFile {
    pub file_id: i64,
    pub track_id: i64,
    pub track_file_type: TrackFileType,

    pub library_id: Option<i64>,
    pub path: String,
    pub is_link: bool,
    pub size_bytes: i64,
    pub hash: Option<String>,

    pub last_accessed_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

impl TrackFile {
    pub fn row_to_track_file(row: &Row<'_>) -> rusqlite::Result<Self> {
        let created_at_ts: i64 = row.get("created_at")?;
        let created_at = DateTime::from_timestamp(created_at_ts, 0).unwrap_or_else(|| Utc::now());

        let last_accessed_at_ts: i64 = row.get("last_accessed_at")?;
        let last_accessed_at =
            DateTime::from_timestamp(last_accessed_at_ts, 0).unwrap_or_else(|| Utc::now());

        Ok(Self {
            file_id: row.get("file_id")?,
            track_id: row.get("track_id")?,
            track_file_type: row.get("track_file_type_id")?,
            library_id: row.get("library_id")?,
            path: row.get("path")?,
            is_link: row.get("is_link")?,
            size_bytes: row.get("size_bytes")?,
            hash: row.get("hash")?,
            last_accessed_at,
            created_at,
        })
    }
}

#[derive(Debug)]
pub struct NewTrackFile {
    pub track_id: i64,
    pub track_file_type: TrackFileType,

    pub library_id: Option<i64>,
    pub path: String,
    pub is_link: bool,
    pub size_bytes: i64,
    pub hash: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackFileResponse {
    #[serde(flatten)]
    pub track_file: TrackFile,
    pub library: Option<Library>,
}

impl TrackFileResponse {
    pub fn row_to_track_file_response(row: &Row<'_>) -> rusqlite::Result<Self> {
        let track_file = TrackFile::row_to_track_file(row)?;

        let library_id: Option<i64> = row.get("lib_library_id")?;

        let library = if library_id.is_some() {
            Some(Library::row_to_library(row, Some("lib_"))?)
        } else {
            None
        };

        Ok(Self {
            track_file,
            library,
        })
    }
}
