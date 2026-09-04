use axum::{
    Router, body::Body, extract::{Request, State}, http::{HeaderValue, StatusCode, header}, middleware::{self, Next}, response::{IntoResponse, Response}, routing::{any, get},
};
use tower_http::trace::TraceLayer;
use std::{net::SocketAddr, time::Duration};
use zelefy_backend::{X_USER_ID, X_USER_ROLE, X_USER_SUBSCRIPTION};
use zelefy_gateway::{
    cache::{connection::init_redis, repository::get_session},
    config::Config,
    AppState,
};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let config = Config::from_env().expect("Config error");
    let redis_manager = init_redis(&config.redis_url).await.expect("Redis error");
    
    let http_client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .pool_max_idle_per_host(100)
        .connect_timeout(Duration::from_secs(5))
        .timeout(Duration::from_secs(30))
        .build()
        .expect("Failed to create reqwest client");

    let state = AppState {
        redis: redis_manager,
        config,
        http_client,
    };

    let public_routes = Router::new()
        .route("/health", get(|| async { "OK" }));

    let app = Router::new()
        .merge(public_routes)
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware))
        .fallback(any(proxy_handler))
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    tracing::info!("API Gateway running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn auth_middleware(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Response {
    let path = req.uri().path();

    let is_public = path == "/health" 
        || path.ends_with("/health")
        || path.contains("/auth/login") 
        || path.contains("/auth/register") 
        || path.contains("/auth/refresh");

    if is_public {
        return next.run(req).await;
    }

    let access_token = match req.headers().get(header::AUTHORIZATION) {
        Some(h) => match h.to_str() {
            Ok(s) if s.starts_with("Bearer ") => &s[7..],
            _ => return StatusCode::UNAUTHORIZED.into_response(),
        },
        None => return StatusCode::UNAUTHORIZED.into_response(),
    };

    let mut redis_conn = state.redis.clone();
    let session = match get_session(&mut redis_conn, access_token).await {
        Ok(Some(sess)) => sess,
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

async fn proxy_handler(
    State(state): State<AppState>,
    mut req: Request,
) -> Response {
    let path = req.uri().path();

    let target_base_url = if path.contains("/auth/") {
        &state.config.auth_url
    } else {
        &state.config.auth_url
    };

    let path_and_query = match req.uri().query() {
        Some(query) => format!("{}?{}", path, query),
        None => path.to_string(),
    };

    let target_url = format!("{}{}", target_base_url, path_and_query);

    req.headers_mut().remove(header::HOST);

    let (parts, body) = req.into_parts();

    let body_stream = body.into_data_stream();
    let reqwest_body = reqwest::Body::wrap_stream(body_stream);

    let upstream_req = state
        .http_client
        .request(parts.method, &target_url)
        .headers(parts.headers)
        .body(reqwest_body);

    match upstream_req.send().await {
        Ok(res) => {
            let mut response_builder = Response::builder().status(res.status());
            if let Some(headers) = response_builder.headers_mut() {
                *headers = res.headers().clone();
            }

            let res_stream = res.bytes_stream();
            let axum_body = Body::from_stream(res_stream);

            response_builder
                .body(axum_body)
                .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response())
        }
        Err(err) => {
            tracing::error!("Proxy error to {}: {:?}", target_url, err);
            StatusCode::BAD_GATEWAY.into_response()
        }
    }
}
