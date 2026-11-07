use chrono::{DateTime, Utc};
use rusqlite::Row;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use zelefy_common::double_option;

use crate::models::tracks::TrackFilesResponse;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Track {
    pub track_id: i64,
    pub local_uuid: Uuid,
    pub title: String,
    pub metadata_artist: Option<String>,

    pub duration_ms: i64,
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
            local_uuid: row.get("local_uuid")?,
            title: row.get("title")?,
            metadata_artist: row.get("metadata_artist")?,
            duration_ms: row.get("duration_ms")?,
            genre: row.get("genre")?,
            bpm: row.get("bpm")?,
            key_signature: row.get("key_signature")?,
            description: row.get("description")?,
            created_at,
        })
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalTrackResponse {
    #[serde(flatten)]
    pub track: Track,
    #[serde(flatten)]
    pub track_files: TrackFilesResponse,
}

#[derive(Debug, Default)]
pub struct NewTrack {
    pub title: String,
    pub local_uuid: Uuid,
    pub metadata_artist: Option<String>,

    pub duration_ms: i64,
    pub genre: Option<String>,
    pub bpm: Option<i64>,
    pub key_signature: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTrack {
    pub title: Option<String>,
    #[serde(default, with = "double_option")]
    pub metadata_artist: Option<Option<String>>,

    #[serde(default, with = "double_option")]
    pub genre: Option<Option<String>>,
    #[serde(default, with = "double_option")]
    pub bpm: Option<Option<i64>>,
    #[serde(default, with = "double_option")]
    pub key_signature: Option<Option<String>>,
    #[serde(default, with = "double_option")]
    pub description: Option<Option<String>>,
}

impl UpdateTrack {
    pub fn is_empty(&self) -> bool {
        self.title.is_none()
            && self.metadata_artist.is_none()
            && self.genre.is_none()
            && self.bpm.is_none()
            && self.key_signature.is_none()
            && self.description.is_none()
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTrackRequest {
    #[serde(flatten)]
    pub update_track: UpdateTrack,
    pub new_cover_path: Option<String>,
}
