use const_format::concatcp;

use crate::paths::API_V1;

pub const TRACK: &str = "/me/tracks";
pub const TRACK_UPLOAD_AUDIO: &str = "/me/tracks/upload-audio";
pub const TRACK_COVER: &str = "/me/tracks/{track_id}/cover";
pub const TRACK_PUBLISH: &str = "/me/tracks/{track_id}/publish";
pub const TRACK_BY_ID: &str = "/public/tracks/{track_id}";
pub const TRACK_BY_PERMALINK: &str = "/public/tracks/{permalink}";

pub const TRACK_FULL: &str = concatcp!(API_V1, TRACK);
pub const TRACK_UPLOAD_AUDIO_FULL: &str = concatcp!(API_V1, TRACK_UPLOAD_AUDIO);
pub const TRACK_COVER_FULL: &str = concatcp!(API_V1, TRACK_COVER);
pub const TRACK_PUBLISH_FULL: &str = concatcp!(API_V1, TRACK_PUBLISH);
pub const TRACK_BY_ID_FULL: &str = concatcp!(API_V1, TRACK_BY_ID);
pub const TRACK_BY_PERMALINK_FULL: &str = concatcp!(API_V1, TRACK_BY_PERMALINK);
