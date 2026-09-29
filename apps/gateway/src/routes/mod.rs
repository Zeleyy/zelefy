use axum::{
    Router, middleware,
    routing::{any, get},
};
use serde_json::json;
use utoipa_swagger_ui::SwaggerUi;

use crate::{AppState, middleware::auth::auth_middleware, proxy::handler::proxy_handler};

pub mod discovery;
pub mod registry;

pub fn routes(state: AppState) -> Router {
    let health_route = Router::new().route("/health", get(|| async { "OK" }));

    let proxy_router =
        Router::new()
            .fallback(any(proxy_handler))
            .layer(middleware::from_fn_with_state(
                state.clone(),
                auth_middleware,
            ));

    let swagger_ui = SwaggerUi::new("/docs")
        .external_url_unchecked("/api-docs/auth/openapi.json", json!({}))
        .external_url_unchecked("/api-docs/profiles/openapi.json", json!({}));

    Router::new()
        .merge(health_route)
        .merge(proxy_router)
        .merge(swagger_ui)
        .with_state(state)
}
