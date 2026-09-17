use redis::{AsyncCommands, aio::ConnectionManager};
use uuid::Uuid;
use zelefy_common::TokenData;

use crate::cache::ops::get_json;

pub async fn get(
    redis: &mut ConnectionManager,
    session_key: &str,
) -> Result<Option<TokenData>, redis::RedisError> {
    get_json(redis, session_key).await
}

pub async fn create(
    redis: &mut ConnectionManager,
    session_key: &str,
    data: &TokenData,
    ttl_seconds: u64,
) -> Result<(), redis::RedisError> {
    let json_data = serde_json::to_string(data).map_err(|e| {
        redis::RedisError::from((redis::ErrorKind::Io, "Serialization error", e.to_string()))
    })?;

    let user_index_key = format!("user_sessions:{}", data.user_id);

    let mut pipe = redis::pipe();
    pipe.atomic()
        .set_ex(session_key, json_data, ttl_seconds)
        .sadd(&user_index_key, session_key)
        .expire(&user_index_key, ttl_seconds as i64);

    let _: () = pipe.query_async(redis).await?;
    Ok(())
}

pub async fn revoke(
    redis: &mut ConnectionManager,
    user_id: Uuid,
    session_key: &str,
) -> Result<(), redis::RedisError> {
    let user_index_key = format!("user_sessions:{}", user_id);

    let mut pipe = redis::pipe();
    pipe.atomic()
        .del(session_key)
        .srem(&user_index_key, session_key);

    pipe.query_async(redis).await?
}

pub async fn revoke_all(
    redis: &mut ConnectionManager,
    user_id: Uuid,
) -> Result<(), redis::RedisError> {
    let user_index_key = format!("user_sessions:{}", user_id);

    let session_keys: Vec<String> = redis.smembers(&user_index_key).await?;

    if !session_keys.is_empty() {
        let mut pipe = redis::pipe();
        pipe.atomic();

        for key in &session_keys {
            pipe.del(key);
        }
        pipe.del(&user_index_key);

        let _: () = pipe.query_async(redis).await?;
    }

    Ok(())
}
