use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    pub port: u16,
    pub redis_url: String,
    pub auth_url: String,
    pub profiles_url: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let _ = dotenvy::dotenv();

        envy::from_env::<Config>()
            .map_err(|err| format!("Ошибка загрузки конфигурации из env: {err}"))
    }
}
