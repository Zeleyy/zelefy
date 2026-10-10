use uuid::Uuid;

#[cfg(feature = "backend")]
use sqlx::prelude::FromRow;

#[derive(Debug, Clone, Default)]
#[cfg_attr(feature = "backend", derive(FromRow))]
pub struct TrackStats {
    pub track_id: Uuid,
    pub plays_count: i64,
    pub likes_count: i32,
    pub reposts_count: i32,
    pub comments_count: i32,
}
