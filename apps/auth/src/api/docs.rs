use utoipa::{Modify, OpenApi, openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme}};
use super::v1::auth;

pub struct SecurityAddon;


impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "bearer_auth",
                SecurityScheme::Http(
                    HttpBuilder::new()
                        .scheme(HttpAuthScheme::Bearer)
                        .bearer_format("Opaque")
                        .build(),
                ),
            );
        }
    }    
}

#[derive(OpenApi)]
#[openapi(
    paths(
        auth::login,
        auth::register,
        auth::refresh,
        auth::logout,
        auth::logout_all,
    ),
    modifiers(&SecurityAddon),
)]
pub struct ApiDoc;
