use aws_sdk_s3::Client;
use sqlx::PgPool;

use crate::config::Config;

pub mod api;
pub mod config;
pub mod db;
pub mod models;
pub mod services;
pub mod storage;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: Config,
    pub s3_client: Client,
}
