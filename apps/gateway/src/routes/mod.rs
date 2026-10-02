use axum::{
    Router, middleware,
    routing::{any, get},
};
use utoipa_swagger_ui::SwaggerUi;

use crate::{AppState, middleware::auth::auth_middleware, proxy::handler::proxy_handler};

pub mod discovery;
pub mod registry;

pub fn routes(state: AppState) -> Router {
    let health_route = Router::new().route("/health", get(|| async { "OK" }));

    let swagger_config = utoipa_swagger_ui::Config::new([
        "/api-docs/auth/openapi.json",
        "/api-docs/profiles/openapi.json",
        "/api-docs/tracks/openapi.json",
    ]);

    let swagger_ui = SwaggerUi::new("/docs").config(swagger_config);

    let proxy_router =
        Router::new()
            .fallback(any(proxy_handler))
            .layer(middleware::from_fn_with_state(
                state.clone(),
                auth_middleware,
            ));

    Router::new()
        .merge(health_route)
        .merge(swagger_ui)
        .merge(proxy_router)
        .with_state(state)
}
