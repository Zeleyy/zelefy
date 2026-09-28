use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Default, FromRow)]
pub struct TrackStats {
    pub track_id: Uuid,
    pub plays_count: i64,
    pub likes_count: i32,
    pub reposts_count: i32,
    pub comments_count: i32,
}
