use redis::{Client, RedisError, aio::ConnectionManager};
use std::time::Duration;


pub async fn init_redis(redis_url: &str) -> Result<ConnectionManager, RedisError> {
    println!("Connecting to Redis...");
    let client = Client::open(redis_url)?;

    let mut manager = ConnectionManager::new(client).await?;

    println!("Checking Redis connection (PING)...");

    let ping_response: String = tokio::time::timeout(
        Duration::from_secs(3),
        redis::cmd("PING").query_async(&mut manager),
    )
    .await
    .map_err(|_| {
        RedisError::from((
            redis::ErrorKind::Io,
            "Timeout connecting to Redis server",
        ))
    })??;

    if ping_response == "PONG" {
        println!("Redis connection established successfully.");
    }

    Ok(manager)
}
