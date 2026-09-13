use sqlx::PgPool;

use crate::{db::repository::profiles, models::profiles::ProfileWithStats, services::errors::ProfileServiceError};

pub async fn get_by_permalink(
    db: &PgPool,
    permalink: String,
) -> Result<ProfileWithStats, ProfileServiceError> {
    let mut tx = db.begin().await?;

    let profile = profiles::get_by_permalink(&mut *tx, permalink)
        .await?
        .ok_or(ProfileServiceError::UserNotFound)?;

    tx.commit().await?;

    Ok(profile)
}
