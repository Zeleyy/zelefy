use redis::aio::ConnectionManager;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{cache::repository::revoke_session, core::security::hash_sha256, db::repository::user_sessions, services::errors::AuthServiceError};

pub struct LogoutParams<'a> {
    pub user_id: Uuid,
    pub access_token: &'a str,
    pub refresh_token: &'a str,
}

pub async fn logout(
    db: &PgPool,
    redis: &mut ConnectionManager,
    params: LogoutParams<'_>,
) -> Result<(), AuthServiceError> {
    let mut tx = db.begin().await?;

    let refresh_token_hash = hash_sha256(params.refresh_token);

    let revoked = user_sessions::revoke_by_hash(&mut *tx, &refresh_token_hash).await?;

    if !revoked {
        return Err(AuthServiceError::InvalidToken);
    }

    revoke_session(redis, params.user_id, params.access_token)
        .await
        .map_err(|e| AuthServiceError::CacheError(e.to_string()))?;

    tx.commit().await?;

    Ok(())
}
