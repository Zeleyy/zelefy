use axum::http::HeaderName;
use serde::de::DeserializeOwned;

use crate::api::errors::ApiError;

pub static X_USER_ID: HeaderName = HeaderName::from_static("x-user-id");
pub static X_USER_ROLE: HeaderName = HeaderName::from_static("x-user-role");
pub static X_USER_SUBSCRIPTION: HeaderName = HeaderName::from_static("x-user-subscription");

pub fn parse_header_enum<T: DeserializeOwned>(
    parts: &axum::http::request::Parts,
    header: &HeaderName,
    missing_code: &'static str,
    missing_msg: &'static str,
    invalid_code: &'static str,
    invalid_msg: &'static str,
) -> Result<T, ApiError> {
    let value_str = parts
        .headers
        .get(header)
        .ok_or_else(|| ApiError::bad_request(missing_code, missing_msg))?
        .to_str()
        .map_err(|_| ApiError::bad_request(invalid_code, invalid_msg))?;

    serde_json::from_slice::<T>(format_args!("\"{value_str}\"").to_string().as_bytes())
        .map_err(|_| ApiError::bad_request(invalid_code, invalid_msg))
}
