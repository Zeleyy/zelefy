use chrono::{DateTime, Utc};
use rusqlite::Row;
use serde::Serialize;

use crate::models::tracks::TrackFileResponse;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Track {
    pub track_id: i64,
    pub title: String,
    pub metadata_artist: Option<String>,

    pub duration_seconds: i64,
    pub genre: Option<String>,
    pub bpm: Option<i64>,
    pub key_signature: Option<String>,
    pub description: Option<String>,

    pub created_at: DateTime<Utc>,
}

impl Track {
    pub fn row_to_track(row: &Row<'_>) -> rusqlite::Result<Self> {
        let created_at_ts: i64 = row.get("created_at")?;
        let created_at = DateTime::from_timestamp(created_at_ts, 0).unwrap_or_else(|| Utc::now());

        Ok(Self {
            track_id: row.get("track_id")?,
            title: row.get("title")?,
            metadata_artist: row.get("metadata_artist")?,
            duration_seconds: row.get("duration_seconds")?,
            genre: row.get("genre")?,
            bpm: row.get("bpm")?,
            key_signature: row.get("key_signature")?,
            description: row.get("description")?,
            created_at,
        })
    }
}

#[derive(Debug, Default)]
pub struct NewTrack {
    pub title: String,
    pub metadata_artist: Option<String>,

    pub duration_seconds: i64,
    pub genre: Option<String>,
    pub bpm: Option<i64>,
    pub key_signature: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalTrackResponse {
    #[serde(flatten)]
    pub track: Track,
    pub track_files: Vec<TrackFileResponse>,
}
