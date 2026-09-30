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
        None => {
            tracing::warn!("Route not found in registry: {}", path);
            return StatusCode::NOT_FOUND.into_response();
        }
    };
    drop(registry);

    let target_path_and_query = if path.starts_with("/api-docs/") && path.ends_with("/openapi.json")
    {
        let query = req
            .uri()
            .query()
            .map(|q| format!("?{}", q))
            .unwrap_or_default();
        format!("/api-docs/openapi.json{}", query)
    } else {
        req.uri()
            .path_and_query()
            .map(|pq| pq.as_str().to_string())
            .unwrap_or_else(|| path.to_string())
    };

    let target_uri_str = format!("{}{}", entry.upstream_base, target_path_and_query);

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
