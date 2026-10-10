use aws_sdk_s3::Client;
use axum::body::Bytes;
use serde::Serialize;
use sqlx::PgPool;
use utoipa::ToSchema;
use uuid::Uuid;
use zelefy_backend::{
    img::{ALLOWED_IMAGE_TYPES, convert_to_webp},
    s3::{build_key, delete_object, extract_key_from_url, upload_object},
};
use zelefy_common::profiles::UpdateProfile;

use crate::{config::Config, db::repository::profiles, services::errors::ProfileServiceError};

#[derive(Serialize, ToSchema)]
pub struct UpdateAvatarResponse {
    pub avatar_url: String,
}

pub async fn update_avatar(
    db: PgPool,
    s3_client: Client,
    config: Config,
    user_id: Uuid,
    avatar: Bytes,
    content_type: String,
) -> Result<UpdateAvatarResponse, ProfileServiceError> {
    if !ALLOWED_IMAGE_TYPES.contains(&content_type.as_str()) {
        return Err(ProfileServiceError::UnsupportedImageFormat);
    }

    let bucket_name = &config.s3_bucket;

    let current_profile = profiles::get_by_id(&db, user_id)
        .await?
        .ok_or(ProfileServiceError::UserNotFound)?;

    let old_avatar_key = current_profile
        .avatar_url
        .as_deref()
        .and_then(|url| extract_key_from_url("avatars", url));

    let new_key = build_key("avatars", user_id, "webp");

    let webp_bytes = tokio::task::spawn_blocking(move || convert_to_webp(&avatar, 800, 800))
        .await
        .map_err(|e| ProfileServiceError::ImageProcessingFailed(e.to_string()))?
        .map_err(|_| ProfileServiceError::UnsupportedImageFormat)?;

    upload_object(
        &s3_client,
        bucket_name,
        &new_key,
        Bytes::from(webp_bytes),
        "image/webp",
    )
    .await
    .map_err(ProfileServiceError::S3UploadError)?;

    let new_avatar_url = format!("{}/{}", config.s3_public_url.trim_end_matches('/'), new_key);

    let mut tx = db.begin().await?;

    let update = UpdateProfile {
        avatar_url: Some(Some(new_avatar_url.clone())),
        ..Default::default()
    };

    profiles::update(&mut *tx, user_id, update)
        .await?
        .ok_or(ProfileServiceError::UserNotFound)?;

    if let Err(err) = tx.commit().await {
        let _ = delete_object(&s3_client, bucket_name, &new_key).await;
        return Err(err.into());
    }

    if let Some(old_key) = old_avatar_key {
        if let Err(e) = delete_object(&s3_client, bucket_name, &old_key).await {
            tracing::warn!("Не удалось удалить старую аватарку {}: {:?}", old_key, e);
        }
    }

    Ok(UpdateAvatarResponse {
        avatar_url: new_avatar_url,
    })
}
