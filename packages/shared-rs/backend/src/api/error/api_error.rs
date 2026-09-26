use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};

use crate::api::error::{
    ErrorResponse,
    response::{BoxedError, ErrorDetails, FieldError},
};

#[derive(Debug)]
pub struct ApiError {
    pub status: StatusCode,
    pub code: &'static str,
    pub message: String,
    pub details: Option<ErrorDetails>,
    pub source: Option<Box<dyn std::error::Error + Send + Sync + 'static>>,
}

impl ApiError {
    pub fn unauthorized(code: &'static str, message: impl Into<String>) -> Self {
        Self::new(StatusCode::UNAUTHORIZED, code, message)
    }

    pub fn bad_request(code: &'static str, message: impl Into<String>) -> Self {
        Self::new(StatusCode::BAD_REQUEST, code, message)
    }

    pub fn not_found(code: &'static str, message: impl Into<String>) -> Self {
        Self::new(StatusCode::NOT_FOUND, code, message)
    }

    pub fn conflict(code: &'static str, message: impl Into<String>) -> Self {
        Self::new(StatusCode::CONFLICT, code, message)
    }

    pub fn validation(fields: Vec<FieldError>) -> Self {
        Self {
            status: StatusCode::UNPROCESSABLE_ENTITY,
            code: "VALIDATION_FAILED",
            message: "Проверьте введённые данные".into(),
            details: Some(ErrorDetails::Fields { items: fields }),
            source: None,
        }
    }

    pub fn internal(source: impl std::error::Error + Send + Sync + 'static) -> Self {
        Self {
            status: StatusCode::INTERNAL_SERVER_ERROR,
            code: "INTERNAL_ERROR",
            message: "Внутренняя ошибка сервера".into(),
            details: None,
            source: Some(Box::new(source)),
        }
    }

    pub fn internal_msg(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::INTERNAL_SERVER_ERROR,
            code: "INTERNAL_ERROR",
            message: "Внутренняя ошибка сервера".into(),
            details: None,
            source: Some(Box::new(BoxedError(message.into()))),
        }
    }

    pub fn new(status: StatusCode, code: &'static str, message: impl Into<String>) -> Self {
        Self {
            status,
            code,
            message: message.into(),
            details: None,
            source: None,
        }
    }

    pub fn with_details(mut self, details: ErrorDetails) -> Self {
        self.details = Some(details);
        self
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let current_span = tracing::Span::current();

        current_span.record("error.code", self.code);

        if self.status.is_server_error() {
            if let Some(ref source) = self.source {
                current_span.record("error.source", tracing::field::display(source));
            }
        }

        let body = ErrorResponse {
            code: self.code,
            message: self.message,
            details: self.details,
        };

        (self.status, Json(body)).into_response()
    }
}
