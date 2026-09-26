use axum::http::StatusCode;
pub use error_derive::ApiErrorCode;

use crate::api::error::ApiError;

pub trait ApiErrorCode {
    fn status(&self) -> StatusCode;
    fn code(&self) -> &'static str;
}

impl<E: ApiErrorCode + std::error::Error + Send + Sync + 'static> From<E> for ApiError {
    fn from(err: E) -> Self {
        let status = err.status();
        let code = err.code();

        if status.is_server_error() {
            ApiError {
                status,
                code,
                message: "Внутренняя ошибка сервера".into(),
                details: None,
                source: Some(Box::new(err)),
            }
        } else {
            ApiError {
                status,
                code,
                message: err.to_string(),
                details: None,
                source: None,
            }
        }
    }
}
