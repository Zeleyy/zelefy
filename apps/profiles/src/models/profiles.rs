use std::collections::HashMap;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::prelude::FromRow;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::models::profile_stats::ProfileStats;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, ToSchema)]
pub struct Profile {
    pub user_id: Uuid,
    pub display_name: String,
    pub permalink: String,

    pub avatar_url: Option<String>,
    pub banner_url: Option<String>,
    pub bio: Option<String>,
    pub location: Option<String>,

    #[schema(value_type = HashMap<String, String>)]
    pub social_links: Value,
    pub is_verified: bool,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateProfileDto {
    pub user_id: Uuid,
    pub display_name: String,
    pub permalink: String,

    pub avatar_url: Option<String>,
    pub bio: Option<String>,
    pub location: Option<String>,

    pub social_links: HashMap<String, String>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateProfileDto {
    pub display_name: Option<String>,
    pub permalink: Option<String>,

    pub avatar_url: Option<Option<String>>,
    pub banner_url: Option<Option<String>>,
    pub bio: Option<Option<String>>,
    pub location: Option<Option<String>>,

    pub social_links: Option<HashMap<String, String>>,
    pub is_verified: Option<bool>,
}

impl UpdateProfileDto {
    pub fn is_empty(&self) -> bool {
        self.display_name.is_none()
            && self.permalink.is_none()
            && self.avatar_url.is_none()
            && self.banner_url.is_none()
            && self.bio.is_none()
            && self.location.is_none()
            && self.social_links.is_none()
            && self.is_verified.is_none()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, ToSchema)]
pub struct ProfileWithStats {
    pub user_id: Uuid,
    pub display_name: String,
    pub permalink: String,
    pub avatar_url: Option<String>,
    pub banner_url: Option<String>,
    pub bio: Option<String>,
    pub location: Option<String>,
    #[schema(value_type = HashMap<String, String>)]
    pub social_links: Value,
    pub is_verified: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,

    pub followers_count: i64,
    pub following_count: i64,
    pub tracks_count: i64,
}

impl ProfileWithStats {
    pub fn for_new_profile(profile: Profile) -> Self {
        Self::from_parts(profile, ProfileStats::default())
    }

    pub fn from_parts(profile: Profile, stats: ProfileStats) -> Self {
        Self {
            user_id: profile.user_id,
            display_name: profile.display_name,
            permalink: profile.permalink,
            avatar_url: profile.avatar_url,
            banner_url: profile.banner_url,
            bio: profile.bio,
            location: profile.location,
            social_links: profile.social_links,
            is_verified: profile.is_verified,
            created_at: profile.created_at,
            updated_at: profile.updated_at,

            followers_count: stats.followers_count,
            following_count: stats.following_count,
            tracks_count: stats.tracks_count,
        }
    }
}

impl From<Profile> for ProfileWithStats {
    fn from(profile: Profile) -> Self {
        Self::for_new_profile(profile)
    }
}
