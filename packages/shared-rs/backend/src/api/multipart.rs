use axum::extract::Multipart;
use bytes::Bytes;
use utoipa::ToSchema;

use crate::api::errors::ApiError;

#[derive(ToSchema)]
pub struct ImageForm {
    #[schema(value_type = String, format = Binary)]
    pub file: Bytes,
}

pub async fn extract_file(
    mut multipart: Multipart,
    field_name: &str
) -> Result<Bytes, ApiError> {
    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|_| ApiError::internal_msg("Некорректная multipart-форма"))?
    {
        if field.name() == Some(field_name) {
            return field
                .bytes()
                .await
                .map_err(|_| ApiError::internal_msg("Не удалось прочитать файл"));
        }
    }
    Err(ApiError::internal_msg(format!("Поле '{field_name}' не найдено в форме")))
}
