use axum::http::HeaderName;

pub static X_USER_ID: HeaderName = HeaderName::from_static("x-user-id");
pub static X_USER_ROLE: HeaderName = HeaderName::from_static("x-user-role");
pub static X_USER_SUBSCRIPTION: HeaderName = HeaderName::from_static("x-user-subscription");
