use aws_sdk_s3::Client;
use sqlx::PgPool;

use crate::config::Config;

pub mod config;
pub mod db;
pub mod models;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: Config,
    pub s3_client: Client,
}
