use redis::{AsyncCommands, aio::ConnectionManager};
use zelefy_common::TokenData;

pub async fn get_session(
    redis: &mut ConnectionManager,
    session_key: &str,
) -> Result<Option<TokenData>, redis::RedisError> {
    let json_data: Option<String> = redis.get(session_key).await?;

    match json_data {
        Some(json) => {
            let data: TokenData = serde_json::from_str(&json).map_err(|e| {
                redis::RedisError::from((
                    redis::ErrorKind::Io,
                    "Deserialization error",
                    e.to_string(),
                ))
            })?;
            Ok(Some(data))
        }
        None => Ok(None),
    }
}
