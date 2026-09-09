use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, ToSchema)]
pub struct Follow {
    pub follower_id: Uuid,
    pub followed_id: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateFollowDto {
    pub follower_id: Uuid,
    pub followed_id: Uuid,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct DeleteFollowDto {
    pub follower_id: Uuid,
    pub followed_id: Uuid,
}
