use sqlx::PgPool;
use uuid::Uuid;
use zelefy_common::{
    TrackStatus,
    tracks::{TrackWithStats, UpdateTrack, UpdateTrackRequest},
};

use crate::{
    db::repository::{stats, tracks},
    services::errors::TrackServiceError,
};

pub async fn update(
    db: PgPool,
    user_id: Uuid,
    track_id: Uuid,
    params: UpdateTrackRequest,
) -> Result<TrackWithStats, TrackServiceError> {
    let current_track = tracks::get_by_id(&db, track_id)
        .await?
        .ok_or(TrackServiceError::TrackNotFound)?;

    if current_track.user_id != user_id {
        return Err(TrackServiceError::Forbidden);
    }

    match current_track.status {
        TrackStatus::Failed => return Err(TrackServiceError::TrackProcessingFailed),
        TrackStatus::Processing | TrackStatus::Ready | TrackStatus::Published => {}
    }

    let update = UpdateTrack {
        title: params.title,
        permalink: params.permalink,
        genre: params.genre,
        description: params.description,
        bpm: params.bpm,
        key_signature: params.key_signature,
        is_private: params.is_private,
        ..Default::default()
    };

    if update.is_empty() {
        return Err(TrackServiceError::EmptyUpdate);
    }

    let mut tx = db.begin().await?;

    let track = tracks::update(&mut *tx, track_id, update)
        .await?
        .ok_or(TrackServiceError::TrackNotFound)?;

    let stats = stats::get_by_id(&mut *tx, track_id)
        .await?
        .ok_or(TrackServiceError::TrackNotFound)?;

    tx.commit().await?;

    Ok(TrackWithStats::from_parts(track, stats))
}
