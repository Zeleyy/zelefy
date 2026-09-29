use axum::{
    body::Body,
    extract::{Request, State},
    http::StatusCode,
    response::{IntoResponse, Response},
};
use hyper::{Uri, header};
use std::str::FromStr;

use crate::AppState;

pub async fn proxy_handler(State(state): State<AppState>, mut req: Request<Body>) -> Response {
    let path = req.uri().path();

    let registry = state.registry.read().await;
    let entry = match registry.find(path) {
        Some(e) => e.clone(),
        None => return StatusCode::NOT_FOUND.into_response(),
    };
    drop(registry);

    let path_and_query = req
        .uri()
        .path_and_query()
        .map(|pq| pq.as_str())
        .unwrap_or(path);
    let target_uri_str = format!("{}{}", entry.upstream_base, path_and_query);

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
