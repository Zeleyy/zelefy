use uuid::Uuid;

#[cfg(feature = "backend")]
use serde::{Deserialize, Serialize};
#[cfg(feature = "backend")]
use sqlx::prelude::FromRow;
#[cfg(feature = "backend")]
use utoipa::ToSchema;

#[derive(Debug, Clone, Default)]
#[cfg_attr(feature = "backend", derive(FromRow))]
pub struct ProfileSocialLink {
    pub user_id: Uuid,
    pub platform: String,
    pub url: String,
}

#[derive(Debug)]
#[cfg_attr(feature = "backend", derive(Deserialize, ToSchema))]
pub struct NewProfileSocialLink {
    pub platform: String,
    pub url: String,
}

#[derive(Debug, Default)]
#[cfg_attr(feature = "backend", derive(ToSchema, Deserialize))]
pub struct DeleteProfileSocialLink {
    pub platform: String,
}

#[derive(Debug, Clone)]
#[cfg_attr(feature = "backend", derive(ToSchema, Serialize, Deserialize))]
pub struct ProfileSocialLinkResponse {
    pub platform: String,
    pub url: String,
}

impl From<ProfileSocialLink> for ProfileSocialLinkResponse {
    fn from(social_link: ProfileSocialLink) -> Self {
        Self {
            platform: social_link.platform,
            url: social_link.url,
        }
    }
}
