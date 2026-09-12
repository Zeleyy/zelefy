use aws_sdk_s3::Client;
use sqlx::PgPool;

use crate::config::Config;

pub mod config;
pub mod models;
pub mod db;
pub mod storage;
pub mod api;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: Config,
    pub s3_client: Client,
}
