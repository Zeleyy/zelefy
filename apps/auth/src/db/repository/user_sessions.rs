use chrono::{DateTime, Utc};
use ipnetwork::IpNetwork;
use uuid::Uuid;

use crate::models::user_sessions::UserSession;
use zelefy_common::{SubscriptionTier, UserRole};

pub struct CreateSessionParams {
    pub user_id: Uuid,
    pub refresh_token_hash: String,
    pub device_info: Option<String>,
    pub ip_address: Option<IpNetwork>,
    pub expires_at: DateTime<Utc>,
}

pub async fn create<'e, E>(
    executor: E,
    params: CreateSessionParams,
) -> Result<UserSession, sqlx::Error>
where
    E: sqlx::PgExecutor<'e>,
{
    sqlx::query_as!(
        UserSession,
        r#"
            INSERT INTO user_sessions (user_id, refresh_token_hash, device_info, ip_address, expires_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING 
                session_id, 
                user_id, 
                refresh_token_hash, 
                device_info, 
                ip_address AS "ip_address: IpNetwork", 
                is_revoked, 
                expires_at, 
                created_at
        "#,
        params.user_id,
        params.refresh_token_hash,
        params.device_info,
        params.ip_address as Option<IpNetwork>,
        params.expires_at
    )
    .fetch_one(executor)
    .await
}


pub struct RevokedSessionUser {
    pub user_id: Uuid,
    pub subscription: SubscriptionTier,
    pub role: UserRole,
    pub is_blocked: bool,
}

pub async fn revoke_by_hash_and_get_user<'e, E>(
    executor: E,
    refresh_token_hash: &str,
) -> Result<Option<RevokedSessionUser>, sqlx::Error>
where
    E: sqlx::PgExecutor<'e>,
{
    sqlx::query_as!(
        RevokedSessionUser,
        r#"
            WITH updated_session AS (
                UPDATE user_sessions
                SET is_revoked = TRUE
                WHERE refresh_token_hash = $1
                    AND is_revoked = FALSE
                    AND expires_at > NOW()
                RETURNING user_id
            )
            SELECT 
                u.user_id,
                u.subscription AS "subscription: SubscriptionTier",
                u.role AS "role: UserRole",
                u.is_blocked
            FROM updated_session s
            JOIN users u ON u.user_id = s.user_id
        "#,
        refresh_token_hash
    )
    .fetch_optional(executor)
    .await
}


pub async fn revoke_by_hash<'e, E>(
    executor: E,
    refresh_token_hash: &str,
) -> Result<bool, sqlx::Error>
where
    E: sqlx::PgExecutor<'e>,
{
    let result = sqlx::query!(
        r#"
            UPDATE user_sessions
            SET is_revoked = TRUE
            WHERE refresh_token_hash = $1 AND is_revoked = FALSE
        "#,
        refresh_token_hash
    )
    .execute(executor)
    .await?;
    
    Ok(result.rows_affected() > 0)
}


pub async fn revoke_all_for_user<'e, E>(
    executor: E,
    user_id: Uuid,
) -> Result<u64, sqlx::Error>
where
    E: sqlx::PgExecutor<'e>,
{
    let result = sqlx::query!(
        r#"
            UPDATE user_sessions
            SET is_revoked = TRUE
            WHERE user_id = $1 AND is_revoked = FALSE
        "#,
        user_id
    )
    .execute(executor)
    .await?;

    Ok(result.rows_affected())
}
