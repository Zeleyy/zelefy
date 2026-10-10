use sqlx::PgPool;
use uuid::Uuid;
use zelefy_common::profiles::{
    DeleteProfileSocialLink, NewProfileSocialLink, ProfileDetails, UpdateProfile,
};

use crate::{
    db::repository::{profiles, social_links, stats},
    services::errors::ProfileServiceError,
};

pub struct UpdateParams {
    pub display_name: Option<String>,
    pub permalink: Option<String>,
    pub bio: Option<Option<String>>,
    pub location: Option<Option<String>>,
    pub new_social_links: Option<Vec<NewProfileSocialLink>>,
    pub delete_social_links: Option<Vec<DeleteProfileSocialLink>>,
}

impl UpdateParams {
    fn is_empty(&self) -> bool {
        self.display_name.is_none()
            && self.permalink.is_none()
            && self.bio.is_none()
            && self.location.is_none()
            && self.new_social_links.is_none()
            && self.delete_social_links.is_none()
    }
}

pub async fn update(
    db: PgPool,
    user_id: Uuid,
    params: UpdateParams,
) -> Result<ProfileDetails, ProfileServiceError> {
    if params.is_empty() {
        return Err(ProfileServiceError::EmptyUpdate);
    }

    let mut tx = db.begin().await?;

    let profile = profiles::update(
        &mut *tx,
        user_id,
        UpdateProfile {
            display_name: params.display_name,
            permalink: params.permalink,
            bio: params.bio,
            location: params.location,
            ..Default::default()
        },
    )
    .await?
    .ok_or(ProfileServiceError::UserNotFound)?;

    if let Some(del) = params.delete_social_links {
        social_links::delete(&mut *tx, user_id, del).await?;
    }
    if let Some(new) = params.new_social_links {
        social_links::add(&mut *tx, user_id, new).await?;
    }

    let stats = stats::get_by_id(&mut *tx, user_id).await?;
    let social_links = social_links::get_by_id(&mut *tx, user_id).await?;

    tx.commit().await?;

    Ok(ProfileDetails::from_parts(profile, stats, social_links))
}
