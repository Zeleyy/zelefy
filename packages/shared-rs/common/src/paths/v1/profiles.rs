use const_format::concatcp;

use crate::paths::API_V1;

pub const PROFILE: &str = "/me/profile";
pub const PROFILE_AVATAR: &str = "/me/profile/avatar";
pub const PROFILE_BANNER: &str = "/me/profile/banner";
pub const PROFILE_BY_PERMALINK: &str = "/public/profiles/{permalink}";

pub const PROFILE_FULL: &str = concatcp!(API_V1, PROFILE);
pub const PROFILE_AVATAR_FULL: &str = concatcp!(API_V1, PROFILE_AVATAR);
pub const PROFILE_BANNER_FULL: &str = concatcp!(API_V1, PROFILE_BANNER);
pub const PROFILE_BY_PERMALINK_FULL: &str = concatcp!(API_V1, PROFILE_BY_PERMALINK);
