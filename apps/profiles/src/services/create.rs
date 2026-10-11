use sqlx::PgPool;
use uuid::Uuid;
use zelefy_common::profiles::{NewProfile, ProfileDetails};

use crate::{
    db::repository::{profiles, social_links},
    services::errors::ProfileServiceError,
};

pub async fn create(
    db: PgPool,
    user_id: Uuid,
    params: NewProfile,
) -> Result<ProfileDetails, ProfileServiceError> {
    let mut tx = db.begin().await?;

    let profile = profiles::create(&mut *tx, user_id, params).await?;
    let social_links = social_links::get_by_id(&mut *tx, profile.user_id).await?;

    tx.commit().await?;

    let mut profile_details: ProfileDetails = (profile.into(), social_links).into();
    profile_details.is_me = true;

    Ok(profile_details)
}
