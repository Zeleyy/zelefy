use axum::http::HeaderName;
use serde::de::DeserializeOwned;

use crate::api::error::{ApiError, AuthContextError};

pub static X_USER_ID: HeaderName = HeaderName::from_static("x-user-id");
pub static X_USER_ROLE: HeaderName = HeaderName::from_static("x-user-role");
pub static X_USER_SUBSCRIPTION: HeaderName = HeaderName::from_static("x-user-subscription");

pub fn parse_header_enum<T: DeserializeOwned>(
    parts: &axum::http::request::Parts,
    header: &HeaderName,
    missing: AuthContextError,
    invalid: AuthContextError,
) -> Result<T, ApiError> {
    let value_str = parts
        .headers
        .get(header)
        .ok_or(missing)?
        .to_str()
        .map_err(|_| invalid)?;

    serde_json::from_slice::<T>(format_args!("\"{value_str}\"").to_string().as_bytes())
        .map_err(|_| invalid.into())
}
