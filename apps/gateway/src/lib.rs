use redis::aio::ConnectionManager;
use reqwest::Client;

use crate::config::Config;

pub mod config;
pub mod cache;

#[derive(Clone)]
pub struct AppState {
    pub redis: ConnectionManager,
    pub config: Config,
    pub http_client: Client,
}