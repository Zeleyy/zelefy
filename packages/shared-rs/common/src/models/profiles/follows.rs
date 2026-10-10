use chrono::{DateTime, Utc};
use uuid::Uuid;

#[cfg(feature = "backend")]
use sqlx::prelude::FromRow;

#[derive(Debug, Clone)]
#[cfg_attr(feature = "backend", derive(FromRow))]
pub struct Follow {
    pub follower_id: Uuid,
    pub followed_id: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug)]
pub struct NewFollow {
    pub follower_id: Uuid,
    pub followed_id: Uuid,
}

#[derive(Debug)]
pub struct DeleteFollow {
    pub follower_id: Uuid,
    pub followed_id: Uuid,
}
