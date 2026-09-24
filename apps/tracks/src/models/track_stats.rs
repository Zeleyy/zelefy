use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Default, Serialize, Deserialize, FromRow, ToSchema)]
pub struct TrackStats {
    pub track_id: Uuid,
    pub plays_count: i64,
    pub likes_count: i32,
    pub reposts_count: i32,
    pub comments_count: i32,
}
