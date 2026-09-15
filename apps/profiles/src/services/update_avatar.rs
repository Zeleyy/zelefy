use aws_sdk_s3::Client;
use axum::body::Bytes;
use sqlx::PgPool;
use uuid::Uuid;
use zelefy_backend::s3::{build_key, delete_object, extract_key_from_url, upload_object};

use crate::{
    config::Config,
    db::repository::{profiles, stats},
    models::profiles::{ProfileWithStats, UpdateProfileDto},
    services::errors::ProfileServiceError,
};

pub async fn update_avatar(
    db: &PgPool,
    s3_client: &Client,
    config: &Config,
    user_id: Uuid,
    avatar: Bytes,
    content_type: &str,
) -> Result<ProfileWithStats, ProfileServiceError> {
    let bucket_name = &config.s3_bucket;

    let current_profile = profiles::get_by_id(db, user_id)
        .await?
        .ok_or(ProfileServiceError::UserNotFound)?;

    let old_avatar_key = current_profile
        .avatar_url
        .as_deref()
        .and_then(|url| extract_key_from_url("avatars", url));

    let file_ext = match content_type {
        "image/jpeg" => "jpg",
        "image/webp" => "webp",
        _ => "png",
    };

    let new_key = build_key("avatars", user_id, file_ext);

    // TODO: Добавить конвертацию изображения в безопасный формат

    upload_object(s3_client, bucket_name, &new_key, avatar, content_type)
        .await
        .map_err(ProfileServiceError::S3UploadError)?;

    let new_avatar_url = format!("{}/{}", config.s3_public_url.trim_end_matches('/'), new_key);

    let mut tx = db.begin().await?;

    let update = UpdateProfileDto {
        avatar_url: Some(Some(new_avatar_url)),
        ..Default::default()
    };

    let profile = profiles::update(&mut *tx, user_id, update).await?;
    let stats = stats::get_by_id(&mut *tx, user_id).await?;

    if let Err(err) = tx.commit().await {
        let _ = delete_object(s3_client, bucket_name, &new_key).await;
        return Err(err.into());
    }

    if let Some(old_key) = old_avatar_key {
        if let Err(e) = delete_object(s3_client, bucket_name, &old_key).await {
            tracing::warn!("Не удалось удалить старую аватарку {}: {:?}", old_key, e);
        }
    }

    Ok(ProfileWithStats::from_parts(profile, stats))
}
