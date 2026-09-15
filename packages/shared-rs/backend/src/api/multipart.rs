use axum::extract::Multipart;
use bytes::Bytes;
use utoipa::ToSchema;

use crate::api::errors::ApiError;

#[derive(ToSchema)]
pub struct ImageForm {
    #[schema(value_type = String, format = Binary)]
    pub file: Bytes,
}

// pub async fn extract_file(
//     mut multipart: Multipart,
//     field_name: &str
// ) -> Result<Bytes, ApiError> {
//     while let Some(field) = multipart
//         .next_field()
//         .await
//         .map_err(|_| ApiError::internal_msg("Некорректная multipart-форма"))?
//     {
//         if field.name() == Some(field_name) {
//             return field
//                 .bytes()
//                 .await
//                 .map_err(|_| ApiError::internal_msg("Не удалось прочитать файл"));
//         }
//     }
//     Err(ApiError::internal_msg(format!("Поле '{field_name}' не найдено в форме")))
// }

pub async fn extract_file(
    mut multipart: Multipart,
    field_name: &str,
) -> Result<(Bytes, String), ApiError> {
    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|_| ApiError::bad_request("VALIDATION_ERROR", "Ошибка чтения формы"))?
    {
        if field.name() == Some(field_name) {
            let content_type = field.content_type().unwrap_or("image/png").to_string();

            let bytes = field
                .bytes()
                .await
                .map_err(|_| ApiError::internal_msg("Ошибка чтения байтов файла"))?;

            return Ok((bytes, content_type));
        }
    }
    Err(ApiError::bad_request(
        "NOT_FOUND",
        "Файл не найден в запросе",
    ))
}
