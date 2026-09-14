use sqlx::PgPool;

use crate::{db::repository::profiles, models::profiles::{CreateProfileDto, ProfileWithStats}, services::errors::ProfileServiceError};

pub async fn create(
    db: &PgPool,
    params: CreateProfileDto,
) -> Result<ProfileWithStats, ProfileServiceError> {
    let mut tx = db.begin().await?;

    let profile = profiles::create(&mut *tx, params).await?;

    tx.commit().await?;

    Ok(profile.into())
}
