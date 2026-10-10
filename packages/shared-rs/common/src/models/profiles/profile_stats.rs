use uuid::Uuid;

#[cfg(feature = "backend")]
use sqlx::prelude::FromRow;

#[derive(Debug, Clone, Default)]
#[cfg_attr(feature = "backend", derive(FromRow))]
pub struct ProfileStats {
    pub user_id: Uuid,
    pub followers_count: i32,
    pub following_count: i32,
    pub tracks_count: i32,
}

#[derive(Debug, Default)]
pub struct UpdateProfileStats {
    pub followers_count: Option<i32>,
    pub following_count: Option<i32>,
    pub tracks_count: Option<i32>,
}
