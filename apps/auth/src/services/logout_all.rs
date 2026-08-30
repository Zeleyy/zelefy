use redis::aio::ConnectionManager;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{cache::repository::revoke_all_user_sessions, db::repository::user_sessions, services::errors::AuthServiceError};

pub struct LogoutAllParams {
    pub user_id: Uuid,
}

pub async fn logout_all(
    db: &PgPool,
    redis: &mut ConnectionManager,
    params: LogoutAllParams,
) -> Result<(), AuthServiceError> {
    let mut tx = db.begin().await?;

    user_sessions::revoke_all_for_user(&mut *tx, params.user_id).await?;

    revoke_all_user_sessions(redis, params.user_id)
        .await
        .map_err(|e| AuthServiceError::CacheError(e.to_string()))?;

    tx.commit().await?;

    Ok(())
}
