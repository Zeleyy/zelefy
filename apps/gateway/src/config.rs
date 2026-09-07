use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub port: u16,
    pub redis_url: String,
    pub auth_url: String,
    pub profiles_url: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let _ = dotenvy::dotenv();

        let port = env::var("GATEWAY_PORT")
            .map_err(|_| "Переменная окружения GATEWAY_PORT не установлена")?
            .parse::<u16>()
            .map_err(|_| "GATEWAY_PORT должна быть положительным числом (u16)")?;

        let redis_url = env::var("REDIS_URL")
            .map_err(|_| "Переменная окружения REDIS_URL не установлена")?;

        let auth_url = env::var("AUTH_SERVICE_URL")
            .map_err(|_| "Переменная окружения AUTH_SERVICE_URL не установлена")?;

        let profiles_url = env::var("PROFILES_SERVICE_URL")
            .map_err(|_| "Переменная окружения PROFILES_SERVICE_URL не установлена")?;

        Ok(Self {
            port,
            redis_url,
            auth_url,
            profiles_url,
        })
    }
}
