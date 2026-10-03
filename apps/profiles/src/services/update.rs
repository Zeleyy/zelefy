use sqlx::PgPool;
use std::collections::HashMap;
use uuid::Uuid;

use crate::{
    db::repository::{profiles, stats},
    models::profiles::{ProfileWithStats, UpdateProfileDto},
    services::errors::ProfileServiceError,
};

pub struct UpdateParams {
    pub display_name: Option<String>,
    pub permalink: Option<String>,
    pub bio: Option<Option<String>>,
    pub location: Option<Option<String>>,
    pub social_links: Option<HashMap<String, String>>,
}

impl UpdateParams {
    fn is_empty(&self) -> bool {
        self.display_name.is_none()
            && self.permalink.is_none()
            && self.bio.is_none()
            && self.location.is_none()
            && self.social_links.is_none()
    }
}

pub async fn update(
    db: PgPool,
    user_id: Uuid,
    params: UpdateParams,
) -> Result<ProfileWithStats, ProfileServiceError> {
    if params.is_empty() {
        return Err(ProfileServiceError::EmptyUpdate);
    }

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
        },
    )
    .await?
    .ok_or(ProfileServiceError::UserNotFound)?;

    let stats = stats::get_by_id(&mut *tx, user_id).await?;

    tx.commit().await?;

    Ok(ProfileWithStats::from_parts(profile, stats))
}
