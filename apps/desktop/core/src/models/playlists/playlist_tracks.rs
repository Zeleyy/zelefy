use crate::models::utils::TimestampMs;

pub struct PlaylistTrack {
    pub playlist_id: i64,
    pub track_id: i64,
    pub position: f64,
    pub added_at: TimestampMs,
}

pub struct NewPlaylistTrack {
    pub playlist_id: i64,
    pub track_id: i64,
    pub position: f64,
}
