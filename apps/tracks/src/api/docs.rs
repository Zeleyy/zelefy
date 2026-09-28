use utoipa::OpenApi;
use zelefy_backend::api::docs::AuthContextSecurityAddon;

#[derive(OpenApi)]
#[openapi(
    paths(
        // 
    ),
    security(
        ("X-User-Id" = []),
        ("X-User-Role" = []),
        ("X-User-Subscription" = []),
    ),
    modifiers(&AuthContextSecurityAddon),
)]
pub struct ApiDoc;
