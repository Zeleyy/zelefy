use axum::Router;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::AppState;
use zelefy_common::paths;

pub mod errors;
pub mod extractors;
pub mod v1;
pub mod docs;

pub fn routes() -> Router<AppState> {
    let api_routes = Router::new()
        .nest(paths::API_V1, v1::routes());

    Router::new()
        .merge(api_routes)
        .merge(
            SwaggerUi::new("/docs")
                .url("/api-docs/openapi.json", docs::ApiDoc::openapi())
                .config(utoipa_swagger_ui::Config::default().with_credentials(true))
        )
}
