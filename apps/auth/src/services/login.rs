use chrono::{Duration, Utc};
use redis::aio::ConnectionManager;
use sqlx::PgPool;
use zelefy_common::TokenData;

use crate::{cache::repository::create_session, config::Config, core::security::{generate_opaque_token, hash_sha256, verify_password}, db::repository::{user_sessions::{self, CreateSessionParams}, users}, services::errors::AuthServiceError};

pub struct AuthTokens {
    pub access_token: String,
    pub refresh_token: String,
}

pub struct LoginParams<'a> {
    pub email: &'a str,
    pub password: &'a str,
}

pub async fn login(
    db: &PgPool,
    redis: &mut ConnectionManager,
    config: &Config,
    params: LoginParams<'_>,
) -> Result<AuthTokens, AuthServiceError> {
    let mut tx = db.begin().await?;

    let user = users::get_by_email(&mut *tx, params.email)
        .await?
        .ok_or(AuthServiceError::InvalidCredentials)?;

    let is_valid = verify_password(params.password, &user.password_hash)
        .map_err(AuthServiceError::HashingError)?;

    if !is_valid {
        return Err(AuthServiceError::InvalidCredentials);
    }

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