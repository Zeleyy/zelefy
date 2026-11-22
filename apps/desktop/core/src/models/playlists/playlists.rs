use rusqlite::Row;
use serde::{Deserialize, Serialize};
use zelefy_common::{CursorPage, double_option};

use crate::models::utils::TimestampMs;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Playlist {
    pub playlist_id: i64,
    pub title: String,
    pub description: Option<String>,
    pub created_at: TimestampMs,
}

impl Playlist {
    pub fn from_row(row: &Row<'_>) -> rusqlite::Result<Self> {
        Ok(Self {
            playlist_id: row.get("playlist_id")?,
            title: row.get("title")?,
            description: row.get("description")?,
            created_at: row.get("created_at")?,
        })
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaylistWithFirstTrackId {
    #[serde(flatten)]
    pub playlist: Playlist,
    pub track_id: Option<i64>,
    #[serde(skip_serializing)]
    pub rank: Option<f64>,
}

impl PlaylistWithFirstTrackId {
    pub fn from_row(row: &Row<'_>) -> rusqlite::Result<Self> {
        Ok(Self {
            playlist: Playlist::from_row(row)?,
            track_id: row.get("track_id")?,
            rank: row.get("rank")?,
        })
    }
}

#[derive(Clone, Copy, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaylistCursor {
    pub playlist_id: i64,
    pub created_at: TimestampMs,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rank: Option<f64>,
}

pub type PlaylistsPage = CursorPage<PlaylistWithFirstTrackId, PlaylistCursor>;

#[derive(Debug, Clone, Deserialize)]
pub struct NewPlaylist {
    pub title: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewPlaylistRequest {
    #[serde(flatten)]
    pub playlist: NewPlaylist,
    pub track_id: i64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdatePlaylist {
    pub title: Option<String>,
    #[serde(default, with = "double_option")]
    pub description: Option<Option<String>>,
}
