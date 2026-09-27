use utoipa::OpenApi;
use zelefy_backend::api::docs::AuthContextSecurityAddon;

use super::v1::auth;

#[derive(OpenApi)]
#[openapi(
    paths(
        auth::login,
        auth::register,
        auth::refresh,
        auth::logout,
        auth::logout_all,
    ),
    security(
        ("X-User-Id" = []),
        ("X-User-Role" = []),
        ("X-User-Subscription" = []),
    ),
    modifiers(&AuthContextSecurityAddon),
)]
pub struct ApiDoc;
