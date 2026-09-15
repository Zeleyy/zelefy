use super::v1::profiles;
use utoipa::{
    Modify, OpenApi,
    openapi::security::{ApiKey, ApiKeyValue, SecurityScheme},
};

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
    modifiers(&SecurityAddon),
)]
pub struct ApiDoc;

struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        let components = openapi.components.as_mut().unwrap();
        components.add_security_scheme(
            "X-User-Id",
            SecurityScheme::ApiKey(ApiKey::Header(ApiKeyValue::new("x-user-id"))),
        );
        components.add_security_scheme(
            "X-User-Role",
            SecurityScheme::ApiKey(ApiKey::Header(ApiKeyValue::new("x-user-role"))),
        );
        components.add_security_scheme(
            "X-User-Subscription",
            SecurityScheme::ApiKey(ApiKey::Header(ApiKeyValue::new("x-user-subscription"))),
        );
    }
}
