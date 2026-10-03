use sqlx::PgPool;

use crate::{
    db::repository::tracks, models::tracks::TrackWithStats, services::errors::TrackServiceError,
};

pub async fn get_by_permalink(
    db: PgPool,
    permalink: String,
) -> Result<TrackWithStats, TrackServiceError> {
    let mut tx = db.begin().await?;

    let track = tracks::get_by_permalink(&mut *tx, permalink)
        .await?
        .ok_or(TrackServiceError::TrackNotFound)?;

    tx.commit().await?;

    Ok(track)
}
