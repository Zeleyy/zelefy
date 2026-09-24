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
