use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub redis_url: String,
    pub access_token_ttl_seconds: u64,
    pub refresh_token_ttl_days: i64,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let _ = dotenvy::dotenv();

        let database_url = env::var("DATABASE_URL")
            .map_err(|_| "Переменная окружения DATABASE_URL не установлена")?;

        let redis_url = env::var("REDIS_URL")
            .map_err(|_| "Переменная окружения REDIS_URL не установлена")?;

        let access_token_ttl_seconds = env::var("ACCESS_TOKEN_TTL_SECONDS")
            .map_err(|_| "Переменная окружения ACCESS_TOKEN_TTL_SECONDS не установлена")?
            .parse::<u64>()
            .map_err(|_| "ACCESS_TOKEN_TTL_SECONDS должна быть положительным числом (u64)")?;

        let refresh_token_ttl_days = env::var("REFRESH_TOKEN_TTL_DAYS")
            .map_err(|_| "Переменная окружения REFRESH_TOKEN_TTL_DAYS не установлена")?
            .parse::<i64>()
            .map_err(|_| "REFRESH_TOKEN_TTL_DAYS должна быть числом (i64)")?;

        Ok(Self {
            database_url,
            redis_url,
            access_token_ttl_seconds,
            refresh_token_ttl_days,
        })
    }
}
