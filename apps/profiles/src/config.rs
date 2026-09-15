use std::env;

#[derive(Debug, Clone)]
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

        let port = env::var("PROFILES_PORT")
            .map_err(|_| "Переменная окружения PROFILES_PORT не установлена")?
            .parse::<u16>()
            .map_err(|_| "PROFILES_PORT должна быть положительным числом (u16)")?;

        let database_url = env::var("DATABASE_URL")
            .map_err(|_| "Переменная окружения DATABASE_URL не установлена")?;

        let s3_url =
            env::var("S3_URL").map_err(|_| "Переменная окружения S3_URL не установлена")?;

        let s3_bucket =
            env::var("S3_BUCKET").map_err(|_| "Переменная окружения S3_BUCKET не установлена")?;

        let s3_public_url = env::var("S3_PUBLIC_URL")
            .map_err(|_| "Переменная окружения S3_PUBLIC_URL не установлена")?;

        let s3_region =
            env::var("S3_REGION").map_err(|_| "Переменная окружения S3_REGION не установлена")?;

        let s3_access_key = env::var("S3_ACCESS_KEY")
            .map_err(|_| "Переменная окружения S3_ACCESS_KEY не установлена")?;

        let s3_secret_key = env::var("S3_SECRET_KEY")
            .map_err(|_| "Переменная окружения S3_SECRET_KEY не установлена")?;

        Ok(Self {
            port,
            database_url,
            s3_url,
            s3_bucket,
            s3_public_url,
            s3_region,
            s3_access_key,
            s3_secret_key,
        })
    }
}
