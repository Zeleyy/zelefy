use sqlx::PgPool;
use uuid::Uuid;
use zelefy_common::profiles::ProfileDetails;

use crate::{
    db::repository::{profiles, social_links},
    services::errors::ProfileServiceError,
};

pub async fn get_by_permalink(
    db: PgPool,
    permalink: String,
    viewer_id: Option<Uuid>,
) -> Result<ProfileDetails, ProfileServiceError> {
    let mut tx = db.begin().await?;

    let profile = profiles::get_by_permalink(&mut *tx, permalink)
        .await?
        .ok_or(ProfileServiceError::UserNotFound)?;

    let is_owner = viewer_id == Some(profile.user_id);

    let social_links = social_links::get_by_id(&mut *tx, profile.user_id).await?;

    tx.commit().await?;

    let mut profile_details: ProfileDetails = (profile, social_links).into();
    profile_details.is_me = is_owner;

    Ok(profile_details)
}
