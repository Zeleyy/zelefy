use redis::aio::ConnectionManager;
use sqlx::PgPool;

use crate::config::Config;

pub mod api;
pub mod config;
pub mod core;
pub mod db;
pub mod models;
pub mod services;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub redis: ConnectionManager,
    pub config: Config,
}
