use sqlx::PgPool;

use crate::config::Config;

pub mod config;
pub mod models;
pub mod db;
pub mod api;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: Config,
}
