use chrono::{DateTime, Utc};
use ipnetwork::IpNetwork;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, ToSchema)]
pub struct UserSession {
    pub session_id: Uuid,
    pub user_id: Uuid,
    
    pub refresh_token_hash: String,

    pub device_info: Option<String>,
    #[schema(
        value_type = Option<String>, 
        example = "192.168.1.1 or 2001:db8::1",
    )]
    pub ip_address: Option<IpNetwork>,
    
    pub is_revoked: bool,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateSessionDto {
    pub user_id: Uuid,
    pub refresh_token_hash: String,
    pub device_info: Option<String>,
    pub ip_address: Option<String>,
}
