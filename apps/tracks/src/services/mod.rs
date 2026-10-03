pub mod errors;

pub mod get_by_permalink;
pub mod update;
pub mod update_cover;
pub mod upload_audio;

pub use get_by_permalink::get_by_permalink;
pub use update::update;
pub use update_cover::update_cover;
pub use upload_audio::upload_audio;
