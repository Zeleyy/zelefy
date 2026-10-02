use utoipa::OpenApi;
use zelefy_backend::api::docs::AuthContextSecurityAddon;

use super::v1::tracks;

#[derive(OpenApi)]
#[openapi(
    paths(
        tracks::update,
        tracks::upload_audio,
        tracks::update_cover,
    ),
    security(
        ("X-User-Id" = []),
        ("X-User-Role" = []),
        ("X-User-Subscription" = []),
    ),
    modifiers(&AuthContextSecurityAddon),
)]
pub struct ApiDoc;
