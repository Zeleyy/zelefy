use chrono::{Duration, Utc};
use redis::aio::ConnectionManager;
use sqlx::PgPool;
use zelefy_common::TokenData;

use crate::{cache::repository::create_session, config::Config, core::security::{generate_opaque_token, hash_password, hash_sha256}, db::repository::{user_sessions::{self, CreateSessionParams}, users}, services::errors::AuthServiceError};


pub struct AuthTokens {
    pub access_token: String,
    pub refresh_token: String,
}

pub struct RegisterParams<'a> {
    pub email: &'a str,
    pub password: &'a str,
}

pub async fn register(
    db: &PgPool,
    redis: &mut ConnectionManager,
    config: &Config,
    params: RegisterParams<'_>,
) -> Result<AuthTokens, AuthServiceError> {
    let password_hash = hash_password(params.password)
        .map_err(AuthServiceError::HashingError)?;
    
    let mut tx = db.begin().await?;
    
    let user = users::create(&mut *tx, params.email, &password_hash).await?;

    let access_token = generate_opaque_token("at_sec");
    let refresh_token = generate_opaque_token("rt_sec");

    let access_session = TokenData {
        user_id: user.user_id,
        subscription: user.subscription,
        role: user.role,
    };

    let expires_at = Utc::now() + Duration::days(config.refresh_token_ttl_days);

    let refresh_session = CreateSessionParams {
        user_id: user.user_id,
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
        config.access_token_ttl_seconds
    )
    .await
    .map_err(|e| AuthServiceError::CacheError(e.to_string()))?;

    tx.commit().await?;

    Ok(AuthTokens {
        access_token,
        refresh_token,
    })
}
