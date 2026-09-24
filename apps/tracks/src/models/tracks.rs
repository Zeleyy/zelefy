use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::models::track_stats::TrackStats;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, ToSchema)]
pub struct Track {
    pub track_id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub permalink: String,
    pub audio_url: String,
    pub cover_url: Option<String>,
    pub duration_seconds: i32,
    pub genre: Option<String>,
    pub description: Option<String>,
    pub bpm: Option<i32>,
    pub key_signature: Option<String>,
    pub is_private: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateTrackDto {
    pub title: String,
    pub permalink: String,
    pub audio_url: String,
    pub cover_url: Option<String>,
    pub duration_seconds: i32,
    pub genre: Option<String>,
    pub description: Option<String>,
    pub bpm: Option<i32>,
    pub key_signature: Option<String>,
    pub is_private: bool,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateTrackDto {
    pub title: Option<String>,
    pub permalink: Option<String>,
    pub cover_url: Option<Option<String>>,
    pub genre: Option<Option<String>>,
    pub description: Option<Option<String>>,
    pub bpm: Option<Option<i32>>,
    pub key_signature: Option<Option<String>>,
    pub is_private: Option<bool>,
}

impl UpdateTrackDto {
    pub fn is_empty(&self) -> bool {
        self.title.is_none()
            && self.permalink.is_none()
            && self.cover_url.is_none()
            && self.genre.is_none()
            && self.description.is_none()
            && self.bpm.is_none()
            && self.key_signature.is_none()
            && self.is_private.is_none()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, ToSchema)]
pub struct TrackWithStats {
    pub track_id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub permalink: String,
    pub audio_url: String,
    pub cover_url: Option<String>,
    pub duration_seconds: i32,
    pub genre: Option<String>,
    pub description: Option<String>,
    pub bpm: Option<i32>,
    pub key_signature: Option<String>,
    pub is_private: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,

    pub plays_count: i64,
    pub likes_count: i32,
    pub reposts_count: i32,
    pub comments_count: i32,
}

impl TrackWithStats {
    pub fn for_new_track(track: Track) -> Self {
        Self::from_parts(track, TrackStats::default())
    }

    pub fn from_parts(track: Track, stats: TrackStats) -> Self {
        Self {
            track_id: track.track_id,
            user_id: track.user_id,
            title: track.title,
            permalink: track.permalink,
            audio_url: track.audio_url,
            cover_url: track.cover_url,
            duration_seconds: track.duration_seconds,
            genre: track.genre,
            description: track.description,
            bpm: track.bpm,
            key_signature: track.key_signature,
            is_private: track.is_private,
            created_at: track.created_at,
            updated_at: track.updated_at,

            plays_count: stats.plays_count,
            likes_count: stats.likes_count,
            reposts_count: stats.reposts_count,
            comments_count: stats.comments_count,
        }
    }
}

impl From<Track> for TrackWithStats {
    fn from(track: Track) -> Self {
        Self::for_new_track(track)
    }
}
