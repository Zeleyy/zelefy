use utoipa::OpenApi;
use zelefy_backend::api::docs::AuthContextSecurityAddon;

use super::v1::profiles;

#[derive(OpenApi)]
#[openapi(
    paths(
        profiles::get_by_permalink,
        profiles::create,
        profiles::update,
        profiles::update_avatar,
        profiles::update_banner,
    ),
    security(
        ("X-User-Id" = []),
        ("X-User-Role" = []),
        ("X-User-Subscription" = []),
    ),
    modifiers(&AuthContextSecurityAddon),
)]
pub struct ApiDoc;
