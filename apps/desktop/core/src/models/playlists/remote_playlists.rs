use uuid::Uuid;

use crate::models::utils::TimestampMs;

pub struct RemotePlaylist {
    pub playlist_id: i64,
    pub server_id: i64,
    pub remote_id: Uuid,
    pub user_id: Uuid,
    pub profile_id: i64,

    pub permalink: String,
    pub is_album: bool,
    pub is_private: bool,

    pub remote_created_at: TimestampMs,
    pub remote_updated_at: Option<TimestampMs>,
    pub synced_at: TimestampMs,
}
