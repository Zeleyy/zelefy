use rusqlite::Row;

use crate::models::utils::TimestampMs;

#[derive(Debug, Clone)]
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

pub struct NewPlaylist {
    pub title: String,
    pub description: Option<String>,
}

pub struct UpdatePlaylist {
    pub title: Option<String>,
    pub description: Option<Option<String>>,
}
