use redis::{Client, ErrorKind, RedisError, aio::ConnectionManager};
use std::time::Duration;

pub async fn init_cache(cache_url: &str) -> Result<ConnectionManager, RedisError> {
    tracing::info!("Connecting to cache server...");
    let client = Client::open(cache_url)?;

    let mut manager = ConnectionManager::new(client).await?;

    tracing::info!("Checking cache connection (PING)...");

    let ping_response: String = tokio::time::timeout(
        Duration::from_secs(3),
        redis::cmd("PING").query_async(&mut manager),
    )
    .await
    .map_err(|_| RedisError::from((ErrorKind::Io, "Timeout connecting to cache server")))??;

    if ping_response == "PONG" {
        tracing::info!("Cache connection established successfully.");
    }

    Ok(manager)
}
