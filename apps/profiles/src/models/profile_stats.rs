use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Default, Serialize, Deserialize, FromRow, ToSchema)]
pub struct ProfileStats {
    pub user_id: Uuid,
    pub followers_count: i32,
    pub following_count: i32,
    pub tracks_count: i32,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateProfileStatsDto {
    pub followers_count: Option<i32>,
    pub following_count: Option<i32>,
    pub tracks_count: Option<i32>,
}
