use axum::{
    body::Body,
    extract::{Request, State},
    http::StatusCode,
    response::{IntoResponse, Response},
};
use hyper::{Uri, header};
use std::str::FromStr;

use crate::{AppState, config::Config};

pub fn get_upstream_target<'a>(config: &'a Config, path: &str) -> Option<&'a str> {
    if path.contains("/auth/") {
        Some(&config.auth_url)
    } else if path.contains("/profiles/") || path.contains("/me/profile") {
        Some(&config.profiles_url)
    } else {
        None
    }
}

pub async fn proxy_handler(State(state): State<AppState>, mut req: Request<Body>) -> Response {
    let path = req.uri().path();
    let upstream_base = match get_upstream_target(&state.config, path) {
        Some(base) => base,
        None => return StatusCode::NOT_FOUND.into_response(),
    };

    let path_and_query = req
        .uri()
        .path_and_query()
        .map(|pq| pq.as_str())
        .unwrap_or(path);

    let target_uri_str = format!("{}{}", upstream_base, path_and_query);

    let target_uri = match Uri::from_str(&target_uri_str) {
        Ok(uri) => uri,
        Err(_) => return StatusCode::BAD_REQUEST.into_response(),
    };

    *req.uri_mut() = target_uri;

    req.headers_mut().remove(header::HOST);

    match state.http_client.request(req).await {
        Ok(hyper_res) => {
            let (parts, incoming_body) = hyper_res.into_parts();
            let response_body = Body::new(incoming_body);
            Response::from_parts(parts, response_body)
        }
        Err(err) => {
            tracing::error!("Proxy upstream error to {}: {:?}", target_uri_str, err);
            StatusCode::BAD_GATEWAY.into_response()
        }
    }
}
