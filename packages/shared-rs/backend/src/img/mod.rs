pub mod convert_to_webp;
pub mod errors;

pub use convert_to_webp::*;
pub use errors::*;

pub const ALLOWED_IMAGE_TYPES: &[&str] = &["image/jpeg", "image/png", "image/webp"];

pub const MAX_UPLOAD_AVATAR_SIZE: usize = 12 * 1024 * 1024;
pub const MAX_UPLOAD_BANNER_SIZE: usize = 17 * 1024 * 1024;

pub const MAX_UPLOAD_COVER_SIZE: usize = 12 * 1024 * 1024;
pub const MAX_UPLOAD_AUDIO_SIZE: usize = 102 * 1024 * 1024;
