use utoipa::{
    Modify,
    openapi::security::{ApiKey, ApiKeyValue, SecurityScheme},
};

pub struct AuthContextSecurityAddon;

impl Modify for AuthContextSecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        let components = openapi.components.as_mut().unwrap();
        for (name, header) in [
            ("X-User-Id", "x-user-id"),
            ("X-User-Role", "x-user-role"),
            ("X-User-Subscription", "x-user-subscription"),
        ] {
            components.add_security_scheme(
                name,
                SecurityScheme::ApiKey(ApiKey::Header(ApiKeyValue::new(header))),
            );
        }
    }
}
