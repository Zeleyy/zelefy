use serde::{Deserialize, Serialize};
#[cfg(feature = "backend")]
use sqlx::prelude::Type;
#[cfg(feature = "backend")]
use utoipa::ToSchema;


#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "backend", derive(Type, ToSchema))]
#[cfg_attr(feature = "backend", sqlx(type_name = "user_role", rename_all = "snake_case"))]
#[serde(rename_all = "snake_case")]
pub enum UserRole {
    User,
    Moderator,
    Admin,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "backend", derive(Type, ToSchema))]
#[cfg_attr(feature = "backend", sqlx(type_name = "subscription_tier", rename_all = "snake_case"))]
#[serde(rename_all = "snake_case")]
pub enum SubscriptionTier {
    Free,
    ProPlus,
    ProUnlimited,
}
