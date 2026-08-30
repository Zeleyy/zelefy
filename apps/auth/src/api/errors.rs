use axum::{Json, http::StatusCode, response::{IntoResponse, Response}};
use serde::Serialize;
use utoipa::ToSchema;

use crate::services::errors::AuthServiceError;

#[derive(Debug, Serialize, ToSchema)]
pub struct ErrorResponse {
    pub message: String,
}

#[derive(Debug)]
pub enum ApiError {
    Unauthorized(String),
    BadRequest(String),
    NotFound(String),
    Conflict(String),
    InternalServerError,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            ApiError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg),
            ApiError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            ApiError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            ApiError::Conflict(msg) => (StatusCode::CONFLICT, msg),
            ApiError::InternalServerError => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Внутренняя ошибка сервера".to_string(),
            ),
        };

        (status, Json(ErrorResponse { message })).into_response()
    }
}

impl From<AuthServiceError> for ApiError {
    fn from(err: AuthServiceError) -> Self {
        match err {
            AuthServiceError::InvalidCredentials => {
                ApiError::Unauthorized("Неверный email или пароль".into())
            }

            AuthServiceError::UserAlreadyExists => {
                ApiError::Conflict("Пользователь с таким email уже существует".into())
            }

            AuthServiceError::UserNotFound => {
                ApiError::NotFound("Пользователь не найден".into())
            }

            AuthServiceError::InvalidToken => {
                ApiError::Unauthorized("Токен недействителен или истек".into())
            }

            AuthServiceError::HashingError(_) => ApiError::InternalServerError,

            AuthServiceError::DatabaseError(sqlx::Error::Database(db_err))
                if db_err.is_unique_violation() =>
            {
                ApiError::Conflict("Пользователь с таким email уже существует".into())
            }

            AuthServiceError::DatabaseError(_) | AuthServiceError::CacheError(_) => {
                ApiError::InternalServerError
            }
        }
    }
}
