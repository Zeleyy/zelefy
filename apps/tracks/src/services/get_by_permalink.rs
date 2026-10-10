use sqlx::PgPool;
use uuid::Uuid;
use zelefy_common::{TrackStatus, tracks::TrackResponse};

use crate::{db::repository::tracks, services::errors::TrackServiceError};

pub async fn get_by_permalink(
    db: PgPool,
    permalink: String,
    viewer_id: Option<Uuid>,
) -> Result<TrackResponse, TrackServiceError> {
    let track = tracks::get_by_permalink(&db, permalink)
        .await?
        .ok_or(TrackServiceError::TrackNotFound)?;

    let is_owner = viewer_id == Some(track.user_id);

    if track.is_private && !is_owner {
        return Err(TrackServiceError::TrackNotFound);
    }

    if !is_owner && !matches!(track.status, TrackStatus::Ready | TrackStatus::Published) {
        return Err(TrackServiceError::TrackNotFound);
    }

    if is_owner {
        Ok(TrackResponse::Full(track.into()))
    } else {
        Ok(TrackResponse::Public(track.into()))
    }
}
