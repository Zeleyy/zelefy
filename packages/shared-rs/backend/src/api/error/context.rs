use crate::api::error::ApiErrorCode;

#[derive(Debug, Clone, Copy, thiserror::Error, ApiErrorCode)]
pub enum AuthContextError {
    #[error("Missing auth header")]
    #[api_error(status = 401, code = "MISSING_AUTH_HEADER")]
    MissingAuthHeader,

    #[error("Malformed auth header")]
    #[api_error(status = 401, code = "MALFORMED_AUTH_HEADER")]
    MalformedAuthHeader,

    #[error("Invalid access token")]
    #[api_error(status = 401, code = "INVALID_ACCESS_TOKEN")]
    InvalidAccessToken,

    #[error("Session store error")]
    #[api_error(status = 401, code = "SESSION_STORE_ERROR")]
    SessionStoreError,

    #[error("Missing user id header")]
    #[api_error(status = 400, code = "MISSING_USER_ID_HEADER")]
    MissingUserIdHeader,

    #[error("Invalid user id header")]
    #[api_error(status = 400, code = "INVALID_USER_ID_HEADER")]
    InvalidUserIdHeader,

    #[error("Missing user role header")]
    #[api_error(status = 400, code = "MISSING_USER_ROLE_HEADER")]
    MissingUserRoleHeader,

    #[error("Invalid user role header")]
    #[api_error(status = 400, code = "INVALID_USER_ROLE_HEADER")]
    InvalidUserRoleHeader,

    #[error("Missing user subscription header")]
    #[api_error(status = 400, code = "MISSING_USER_SUBSCRIPTION_HEADER")]
    MissingUserSubscriptionHeader,

    #[error("Invalid user subscription header")]
    #[api_error(status = 400, code = "INVALID_USER_SUBSCRIPTION_HEADER")]
    InvalidUserSubscriptionHeader,
}
