use redis::aio::ConnectionManager;
use sqlx::PgPool;

use crate::config::Config;

pub mod config;
pub mod models;
pub mod core;
pub mod db;
pub mod cache;
pub mod services;
pub mod api;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub redis: ConnectionManager,
    pub config: Config,
}
