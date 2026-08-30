use chrono::{Duration, Utc};
use redis::aio::ConnectionManager;
use sqlx::PgPool;
use zelefy_common::TokenData;

use crate::{cache::repository::create_session, config::Config, core::security::{generate_opaque_token, hash_sha256}, db::repository::{user_sessions::{self, CreateSessionParams}}, services::errors::AuthServiceError};

pub struct AuthTokens {
    pub access_token: String,
    pub refresh_token: String,
}

pub struct RefreshParams<'a> {
    pub refresh_token: &'a str,
}

pub async fn refresh(
    db: &PgPool,
    redis: &mut ConnectionManager,
    config: &Config,
    params: RefreshParams<'_>,
) -> Result<AuthTokens, AuthServiceError> {
    let mut tx = db.begin().await?;

    let refresh_token_hash = hash_sha256(params.refresh_token);

    let session_user = user_sessions::revoke_by_hash_and_get_user(&mut *tx, &refresh_token_hash)
        .await?
        .ok_or(AuthServiceError::InvalidToken)?;

    let access_token = generate_opaque_token("at_sec");
    let refresh_token = generate_opaque_token("rt_sec");

    let access_session = TokenData {
        user_id: session_user.user_id,
        subscription: session_user.subscription,
        role: session_user.role,
    };

    let expires_at = Utc::now() + Duration::days(config.refresh_token_ttl_days);

    let refresh_session = CreateSessionParams {
        user_id: session_user.user_id,
        refresh_token_hash: hash_sha256(&refresh_token),
        device_info: None,
        ip_address: None,
        expires_at,
    };

    user_sessions::create(&mut *tx, refresh_session).await?;

    create_session(
        redis,
        &access_token,
        &access_session,
        config.access_token_ttl_seconds,
    )
    .await
    .map_err(|e| AuthServiceError::CacheError(e.to_string()))?;

    tx.commit().await?;

    Ok(AuthTokens {
        access_token,
        refresh_token,
    })
}
