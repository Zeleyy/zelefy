use chrono::{DateTime, Utc};
use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow)]
pub struct Playlist {
    pub playlist_id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub permalink: String,
    pub description: Option<String>,
    pub is_album: bool,
    pub cover_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug)]
pub struct NewPlaylist {
    pub title: String,
    pub permalink: String,
    pub description: Option<String>,
    pub is_album: bool,
    pub cover_url: Option<String>,
}

#[derive(Debug)]
pub struct UpdatePlaylist {
    pub title: Option<String>,
    pub permalink: Option<String>,
    pub description: Option<Option<String>>,
    pub is_album: Option<bool>,
    pub cover_url: Option<Option<String>>,
}

impl UpdatePlaylist {
    pub fn is_empty(&self) -> bool {
        self.title.is_none()
            && self.permalink.is_none()
            && self.description.is_none()
            && self.is_album.is_none()
            && self.cover_url.is_none()
    }
}
