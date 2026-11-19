use rusqlite::Row;
use serde::{Deserialize, Serialize};
use zelefy_common::CursorPage;

use crate::models::utils::TimestampMs;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaylistTrack {
    pub playlist_id: i64,
    pub track_id: i64,
    pub position: f64,
    pub added_at: TimestampMs,
}

impl PlaylistTrack {
    pub fn from_row(row: &Row<'_>) -> rusqlite::Result<Self> {
        Ok(Self {
            playlist_id: row.get("playlist_id")?,
            track_id: row.get("track_id")?,
            position: row.get("position")?,
            added_at: row.get("added_at")?,
        })
    }
}

#[derive(Clone, Copy, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaylistTrackCursor {
    pub position: f64,
}

pub type PlaylistTracksPage = CursorPage<PlaylistTrack, PlaylistTrackCursor>;

pub struct NewPlaylistTrack {
    pub playlist_id: i64,
    pub track_id: i64,
    pub position: f64,
}

#[derive(Clone, Copy, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MoveTrackRequest {
    pub track_id: i64,
    pub after_track_id: Option<i64>,
    pub before_track_id: Option<i64>,
}
