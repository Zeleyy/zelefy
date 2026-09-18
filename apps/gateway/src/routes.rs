use axum::{
    Router, middleware,
    routing::{any, get},
};

use crate::{AppState, middleware::auth::auth_middleware, proxy::handler::proxy_handler};

pub fn routes(state: AppState) -> Router {
    let health_route = Router::new().route("/health", get(|| async { "OK" }));

    let proxy_router =
        Router::new()
            .fallback(any(proxy_handler))
            .layer(middleware::from_fn_with_state(
                state.clone(),
                auth_middleware,
            ));

    Router::new()
        .merge(health_route)
        .merge(proxy_router)
        .with_state(state)
}
