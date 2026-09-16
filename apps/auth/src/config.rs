use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    pub port: u16,
    pub database_url: String,
    pub redis_url: String,
    pub access_token_ttl_seconds: u64,
    pub refresh_token_ttl_days: i64,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let _ = dotenvy::dotenv();

        envy::from_env::<Config>()
            .map_err(|err| format!("Ошибка загрузки конфигурации из env: {err}"))
    }
}
