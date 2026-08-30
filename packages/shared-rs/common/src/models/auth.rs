use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{SubscriptionTier, UserRole};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenData {
    pub user_id: Uuid,
    pub subscription: SubscriptionTier,
    pub role: UserRole,
}
