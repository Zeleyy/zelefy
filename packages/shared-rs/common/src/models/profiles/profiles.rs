use chrono::{DateTime, Utc};
use std::collections::HashMap;
use uuid::Uuid;

#[cfg(feature = "backend")]
use serde::Deserialize;
#[cfg(feature = "backend")]
use serde::Serialize;
#[cfg(feature = "backend")]
use sqlx::prelude::FromRow;
#[cfg(feature = "backend")]
use utoipa::ToSchema;

use crate::profiles::ProfileSocialLink;
use crate::profiles::ProfileSocialLinkResponse;
use crate::profiles::ProfileStats;

#[derive(Debug, Clone)]
#[cfg_attr(feature = "backend", derive(FromRow))]
pub struct Profile {
    pub user_id: Uuid,
    pub display_name: String,
    pub permalink: String,

    pub avatar_url: Option<String>,
    pub banner_url: Option<String>,
    pub bio: Option<String>,
    pub location: Option<String>,

    pub is_verified: bool,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug)]
#[cfg_attr(feature = "backend", derive(Deserialize, ToSchema))]
pub struct NewProfile {
    pub display_name: String,
    pub permalink: String,

    pub bio: Option<String>,
    pub location: Option<String>,

    pub social_links: Option<HashMap<String, String>>,
}

#[derive(Debug, Default)]
pub struct UpdateProfile {
    pub display_name: Option<String>,
    pub permalink: Option<String>,

    pub avatar_url: Option<Option<String>>,
    pub banner_url: Option<Option<String>>,
    pub bio: Option<Option<String>>,
    pub location: Option<Option<String>>,

    pub is_verified: Option<bool>,
}

impl UpdateProfile {
    pub fn is_empty(&self) -> bool {
        self.display_name.is_none()
            && self.permalink.is_none()
            && self.avatar_url.is_none()
            && self.banner_url.is_none()
            && self.bio.is_none()
            && self.location.is_none()
            && self.is_verified.is_none()
    }
}

#[derive(Debug, Clone)]
#[cfg_attr(feature = "backend", derive(FromRow, Serialize, ToSchema))]
pub struct ProfileWithStats {
    pub user_id: Uuid,
    pub display_name: String,
    pub permalink: String,

    pub avatar_url: Option<String>,
    pub banner_url: Option<String>,
    pub bio: Option<String>,
    pub location: Option<String>,

    pub is_verified: bool,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,

    pub followers_count: i32,
    pub following_count: i32,
    pub tracks_count: i32,
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

#[derive(Debug, Clone)]
#[cfg_attr(feature = "backend", derive(FromRow, Serialize, ToSchema))]
pub struct ProfileDetails {
    pub user_id: Uuid,
    pub display_name: String,
    pub permalink: String,
    pub avatar_url: Option<String>,
    pub banner_url: Option<String>,
    pub bio: Option<String>,
    pub location: Option<String>,
    pub is_verified: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,

    pub followers_count: i32,
    pub following_count: i32,
    pub tracks_count: i32,

    pub social_links: Vec<ProfileSocialLinkResponse>,
}

impl From<(ProfileWithStats, Vec<ProfileSocialLink>)> for ProfileDetails {
    fn from((p, sl): (ProfileWithStats, Vec<ProfileSocialLink>)) -> Self {
        Self {
            user_id: p.user_id,
            display_name: p.display_name,
            permalink: p.permalink,
            avatar_url: p.avatar_url,
            banner_url: p.banner_url,
            bio: p.bio,
            location: p.location,
            is_verified: p.is_verified,
            created_at: p.created_at,
            updated_at: p.updated_at,
            followers_count: p.followers_count,
            following_count: p.following_count,
            tracks_count: p.tracks_count,
            social_links: sl.into_iter().map(Into::into).collect(),
        }
    }
}

impl ProfileDetails {
    pub fn from_parts(p: Profile, s: ProfileStats, sl: Vec<ProfileSocialLink>) -> Self {
        Self {
            user_id: p.user_id,
            display_name: p.display_name,
            permalink: p.permalink,
            avatar_url: p.avatar_url,
            banner_url: p.banner_url,
            bio: p.bio,
            location: p.location,
            is_verified: p.is_verified,
            created_at: p.created_at,
            updated_at: p.updated_at,

            followers_count: s.followers_count,
            following_count: s.following_count,
            tracks_count: s.tracks_count,

            social_links: sl.into_iter().map(Into::into).collect(),
        }
    }
}
