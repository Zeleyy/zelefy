use redis::{AsyncCommands, aio::ConnectionManager};
use serde::de::DeserializeOwned;

pub async fn get_json<T: DeserializeOwned>(
    redis: &mut ConnectionManager,
    key: &str,
) -> Result<Option<T>, redis::RedisError> {
    let json_data: Option<String> = redis.get(key).await?;
    match json_data {
        Some(json) => {
            let data: T = serde_json::from_str(&json).map_err(|e| {
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
