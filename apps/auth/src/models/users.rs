use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::{FromRow};
use utoipa::ToSchema;
use uuid::Uuid;

use zelefy_common::{SubscriptionTier, UserRole};


#[derive(Debug, Clone, Serialize, Deserialize, FromRow, ToSchema)]
pub struct User {
    pub user_id: Uuid,
    pub email: String,
    
    #[serde(skip_serializing)]
    pub password_hash: String,
    
    pub subscription: SubscriptionTier,
    pub role: UserRole,
    pub is_blocked: bool,
    
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateUserDto {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateUserDto {
    pub subscription: Option<SubscriptionTier>,
    pub role: Option<UserRole>,
    pub is_blocked: Option<bool>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct UserResponseDto {
    pub user_id: Uuid,
    pub email: String,
    pub subscription: SubscriptionTier,
    pub role: UserRole,
    pub is_blocked: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<User> for UserResponseDto {
    fn from(user: User) -> Self {
        Self {
            user_id: user.user_id,
            email: user.email,
            subscription: user.subscription,
            role: user.role,
            is_blocked: user.is_blocked,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }
    }
}
