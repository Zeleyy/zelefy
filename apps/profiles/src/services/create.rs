use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    db::repository::profiles,
    models::profiles::{CreateProfileDto, ProfileWithStats},
    services::errors::ProfileServiceError,
};

pub async fn create(
    db: &PgPool,
    user_id: Uuid,
    params: CreateProfileDto,
) -> Result<ProfileWithStats, ProfileServiceError> {
    let mut tx = db.begin().await?;

    let profile = profiles::create(&mut *tx, user_id, params).await?;

    tx.commit().await?;

    Ok(profile.into())
}
