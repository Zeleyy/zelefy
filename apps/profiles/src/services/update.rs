use std::collections::HashMap;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{db::repository::{profiles, stats}, models::profiles::{ProfileWithStats, UpdateProfileDto}, services::errors::ProfileServiceError};

pub struct UpdateParams {
    pub display_name: Option<String>,
    pub permalink: Option<String>,
    pub bio: Option<Option<String>>,
    pub location: Option<Option<String>>,
    pub social_links: Option<HashMap<String, String>>,
}

pub async fn update(
    db: &PgPool,
    user_id: Uuid,
    params: UpdateParams,
) -> Result<ProfileWithStats, ProfileServiceError> {
    let mut tx = db.begin().await?;

    let profile = profiles::update(
        &mut *tx,
        user_id,
        UpdateProfileDto {
            display_name: params.display_name,
            permalink: params.permalink,
            bio: params.bio,
            location: params.location,
            social_links: params.social_links,

            avatar_url: None,
            banner_url: None,
            is_verified: None,
        }
    )
    .await?;

    let stats = stats::get_by_id(
        &mut *tx,
        user_id
    )
    .await?;

    tx.commit().await?;

    Ok(ProfileWithStats::from_parts(profile, stats))
}
