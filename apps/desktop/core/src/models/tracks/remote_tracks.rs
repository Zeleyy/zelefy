use chrono::{DateTime, Utc};
use uuid::Uuid;
use zelefy_common::TrackStatus;

pub struct RemoteTrack {
    pub track_id: i64,
    pub remote_id: Uuid,
    pub user_id: Uuid,
    pub profile_id: Option<i64>,

    pub permalink: String,
    pub audio_url: Option<String>,
    pub cover_url: Option<String>,
    pub waveform_url: Option<String>,
    pub is_private: bool,

    pub status_id: Option<TrackStatus>,
    pub processing_error: Option<String>,

    pub plays_count: i64,
    pub likes_count: i32,
    pub reposts_count: i32,
    pub comments_count: i32,

    pub remote_created_at: DateTime<Utc>,
    pub remote_updated_at: Option<DateTime<Utc>>,
    pub synced_at: DateTime<Utc>,
}
