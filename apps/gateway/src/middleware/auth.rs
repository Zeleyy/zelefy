use axum::{
    body::Body,
    extract::{Request, State},
    http::{HeaderValue, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
};
use hyper::header;
use zelefy_backend::{X_USER_ID, X_USER_ROLE, X_USER_SUBSCRIPTION, cache::repository::sessions};

use crate::{AppState, proxy::handler::get_upstream_target};

pub fn is_public_path(path: &str) -> bool {
    path == "/health" || path.contains("/public/")
}

pub async fn auth_middleware(
    State(state): State<AppState>,
    mut req: Request<Body>,
    next: Next,
) -> Response {
    let path = req.uri().path();

    if is_public_path(path) {
        return next.run(req).await;
    }

    if get_upstream_target(&state.config, path).is_none() {
        return StatusCode::NOT_FOUND.into_response();
    }

    let access_token = match req.headers().get(header::AUTHORIZATION) {
        Some(h) => match h.to_str() {
            Ok(s) if s.starts_with("Bearer ") => &s[7..],
            _ => return StatusCode::UNAUTHORIZED.into_response(),
        },
        None => return StatusCode::UNAUTHORIZED.into_response(),
    };

    let mut redis_conn = state.redis.clone();

    let session = match sessions::get(&mut redis_conn, access_token).await {
        Ok(Some(s)) => s,
        _ => return StatusCode::UNAUTHORIZED.into_response(),
    };

    let headers = req.headers_mut();

    if let Ok(val) = HeaderValue::from_str(&session.user_id.to_string()) {
        headers.insert(&X_USER_ID, val);
    }

    if let Ok(role_str) = serde_json::to_string(&session.role) {
        if let Ok(val) = HeaderValue::from_str(role_str.trim_matches('"')) {
            headers.insert(&X_USER_ROLE, val);
        }
    }

    if let Ok(sub_str) = serde_json::to_string(&session.subscription) {
        if let Ok(val) = HeaderValue::from_str(sub_str.trim_matches('"')) {
            headers.insert(&X_USER_SUBSCRIPTION, val);
        }
    }

    next.run(req).await
}
