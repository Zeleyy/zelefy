use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub port: u16,
    pub database_url: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let _ = dotenvy::dotenv();

        let port = env::var("PROFILES_PORT")
            .map_err(|_| "Переменная окружения PROFILES_PORT не установлена")?
            .parse::<u16>()
            .map_err(|_| "PROFILES_PORT должна быть положительным числом (u16)")?;

        let database_url = env::var("DATABASE_URL")
            .map_err(|_| "Переменная окружения DATABASE_URL не установлена")?;

        Ok(Self {
            port,
            database_url,
        })
    }
}
