use aws_sdk_s3::Client;
use axum::body::Bytes;
use sqlx::PgPool;
use uuid::Uuid;
use zelefy_backend::s3::{build_key, delete_object, extract_key_from_url, upload_object};

use crate::{
    config::Config,
    db::repository::{stats, tracks},
    models::tracks::{TrackWithStats, UpdateTrack},
    services::errors::TrackServiceError,
};

pub async fn update_cover(
    db: PgPool,
    s3_client: Client,
    config: Config,
    user_id: Uuid,
    track_id: Uuid,
    cover_file: Bytes,
    content_type: String,
) -> Result<TrackWithStats, TrackServiceError> {
    let bucket_name = &config.s3_bucket;

    let current_track = tracks::get_by_id(&db, track_id)
        .await?
        .ok_or(TrackServiceError::TrackNotFound)?;

    if current_track.user_id != user_id {
        return Err(TrackServiceError::Forbidden);
    }

    let old_cover_key = current_track
        .cover_url
        .as_deref()
        .and_then(|url| extract_key_from_url("covers", url));

    let file_ext = match content_type.as_str() {
        "image/jpeg" => "jpg",
        "image/webp" => "webp",
        _ => "png",
    };

    let new_key = build_key("covers", track_id, file_ext);

    // TODO: Добавить конвертацию изображения в безопасный формат

    upload_object(&s3_client, bucket_name, &new_key, cover_file, &content_type)
        .await
        .map_err(TrackServiceError::S3UploadError)?;

    let new_cover_url = format!("{}/{}", config.s3_public_url.trim_end_matches('/'), new_key);

    let mut tx = db.begin().await?;

    let update = UpdateTrack {
        cover_url: Some(Some(new_cover_url)),
        ..Default::default()
    };

    let track = tracks::update(&mut *tx, track_id, update)
        .await?
        .ok_or(TrackServiceError::TrackNotFound)?;

    let stats = stats::get_by_id(&mut *tx, track_id)
        .await?
        .ok_or(TrackServiceError::TrackNotFound)?;

    if let Err(err) = tx.commit().await {
        let _ = delete_object(&s3_client, bucket_name, &new_key).await;
        return Err(err.into());
    }

    if let Some(old_key) = old_cover_key {
        if let Err(e) = delete_object(&s3_client, bucket_name, &old_key).await {
            tracing::warn!("Не удалось удалить старую обложку {}: {:?}", old_key, e);
        }
    }

    Ok(TrackWithStats::from_parts(track, stats))
}
