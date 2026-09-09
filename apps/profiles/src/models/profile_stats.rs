use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, ToSchema)]
pub struct ProfileStat {
    pub user_id: Uuid,
    pub followers_count: i64,
    pub following_count: i64,
    pub tracks_count: i64,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateProfileStatDto {
    pub followers_count: Option<i64>,
    pub following_count: Option<i64>,
    pub tracks_count: Option<i64>,
}
