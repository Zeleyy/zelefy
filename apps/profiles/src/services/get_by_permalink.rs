use sqlx::PgPool;
use zelefy_common::profiles::ProfileDetails;

use crate::{
    db::repository::{profiles, social_links},
    services::errors::ProfileServiceError,
};

pub async fn get_by_permalink(
    db: PgPool,
    permalink: String,
) -> Result<ProfileDetails, ProfileServiceError> {
    let mut tx = db.begin().await?;

    let profile = profiles::get_by_permalink(&mut *tx, permalink)
        .await?
        .ok_or(ProfileServiceError::UserNotFound)?;

    let social_links = social_links::get_by_id(&mut *tx, profile.user_id).await?;

    tx.commit().await?;

    Ok((profile, social_links).into())
}
