use axum::body::Body;
use hyper_util::client::legacy::{Client, connect::HttpConnector};
use redis::aio::ConnectionManager;

use crate::{config::Config, routes::registry::SharedRegistry};

pub mod config;
pub mod middleware;
pub mod proxy;
pub mod routes;

pub type HttpClient = Client<HttpConnector, Body>;

#[derive(Clone)]
pub struct AppState {
    pub cache: ConnectionManager,
    pub config: Config,
    pub http_client: HttpClient,
    pub registry: SharedRegistry,
}
