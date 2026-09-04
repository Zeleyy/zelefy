use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub redis_url: String,
    pub auth_url: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let _ = dotenvy::dotenv();

        let redis_url = env::var("REDIS_URL")
            .map_err(|_| "Переменная окружения REDIS_URL не установлена")?;

        let auth_url = env::var("AUTH_SERVICE_URL")
            .map_err(|_| "Переменная окружения AUTH_SERVICE_URL не установлена")?;

        Ok(Self {
            redis_url,
            auth_url
        })
    }
}
