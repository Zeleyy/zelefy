use aws_sdk_s3::Client;
use axum::body::Bytes;
use sqlx::PgPool;
use uuid::Uuid;
use zelefy_backend::s3::{build_key, delete_object, upload_object};
use zelefy_common::{
    TrackStatus,
    tracks::{NewTrack, TrackWithStats, UpdateTrack},
};

use crate::{config::Config, db::repository::tracks, services::errors::TrackServiceError};

pub async fn upload_audio(
    db: PgPool,
    s3_client: Client,
    config: Config,
    user_id: Uuid,
    audio_file: Bytes,
    content_type: String,
) -> Result<TrackWithStats, TrackServiceError> {
    let file_ext = match content_type.as_str() {
        "audio/mpeg" | "audio/mp3" => "mp3",
        "audio/wav" | "audio/x-wav" => "wav",
        "audio/flac" => "flac",
        _ => return Err(TrackServiceError::UnsupportedAudioFormat),
    };

    let create = NewTrack::new_draft();
    let new_track = tracks::create(&db, user_id, create).await?;

    let track_id = new_track.track_id;
    tokio::spawn(async move {
        if let Err(err) = process_audio_upload(
            &db,
            &s3_client,
            &config,
            track_id,
            audio_file,
            file_ext,
            &content_type,
        )
        .await
        {
            tracing::error!(%track_id, error = %err, "audio processing failed");

            let update = UpdateTrack {
                status: Some(TrackStatus::Failed),
                processing_error: Some(Some(err.to_string())),
                ..Default::default()
            };

            if let Err(e) = tracks::update(&db, track_id, update).await {
                tracing::error!(%track_id, error = %e, "failed to mark track as failed");
            }
        }
    });

    Ok(new_track.into())
}

async fn process_audio_upload(
    db: &PgPool,
    s3_client: &Client,
    config: &Config,
    track_id: Uuid,
    audio_file: Bytes,
    file_ext: &str,
    content_type: &str,
) -> Result<(), TrackServiceError> {
    let bucket_name = &config.s3_bucket;
    let track_key = build_key("tracks", track_id, file_ext);

    upload_object(s3_client, bucket_name, &track_key, audio_file, content_type).await?;

    let new_track_url = format!(
        "{}/{}",
        config.s3_public_url.trim_end_matches('/'),
        track_key
    );

    let update = UpdateTrack {
        audio_url: Some(Some(new_track_url)),
        status: Some(TrackStatus::Ready),
        ..Default::default()
    };

    let updated = tracks::update(db, track_id, update).await?;

    if updated.is_none() {
        let _ = delete_object(s3_client, bucket_name, &track_key).await;
    }

    Ok(())
}
