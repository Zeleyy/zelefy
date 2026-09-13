use strum::AsRefStr;
use zelefy_backend::api::errors::ApiError;

use crate::services::errors::ProfileServiceError;

#[derive(Debug, Clone, Copy, AsRefStr)]
#[strum(serialize_all = "SCREAMING_SNAKE_CASE")]
pub enum ProfileErrorCode {
    UserNotFound,
}

impl From<ProfileServiceError> for ApiError {
    fn from(err: ProfileServiceError) -> Self {
        use ProfileErrorCode::*;

        match err {
            ProfileServiceError::UserNotFound => {
                ApiError::not_found(UserNotFound.as_ref(), "Пользователь не найден")
            }
            ProfileServiceError::DatabaseError(e) => ApiError::internal(e),
        }
    }
}
