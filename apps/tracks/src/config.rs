use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    pub port: u16,
    pub database_url: String,
    pub s3_url: String,
    pub s3_bucket: String,
    pub s3_public_url: String,
    pub s3_region: String,
    pub s3_access_key: String,
    pub s3_secret_key: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let _ = dotenvy::dotenv();

        envy::from_env::<Config>()
            .map_err(|err| format!("Ошибка загрузки конфигурации из env: {err}"))
    }
}
