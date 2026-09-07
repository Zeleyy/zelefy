use axum::Router;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::AppState;

pub mod v1;
pub mod docs;

pub fn routes() -> Router<AppState> {
    let api_routes = Router::new();

    Router::new()
        .merge(api_routes)
        .merge(
            SwaggerUi::new("/docs")
                .url("/api-docs/openapi.json", docs::ApiDoc::openapi())
        )
}
