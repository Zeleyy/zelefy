use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, ToSchema)]
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

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreatePlaylistDto {
    pub title: String,
    pub permalink: String,
    pub description: Option<String>,
    pub is_album: bool,
    pub cover_url: Option<String>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdatePlaylistDto {
    pub title: Option<String>,
    pub permalink: Option<String>,
    pub description: Option<Option<String>>,
    pub is_album: Option<bool>,
    pub cover_url: Option<Option<String>>,
}

impl UpdatePlaylistDto {
    pub fn is_empty(&self) -> bool {
        self.title.is_none()
            && self.permalink.is_none()
            && self.description.is_none()
            && self.is_album.is_none()
            && self.cover_url.is_none()
    }
}
