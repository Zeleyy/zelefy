pub mod mutations;
pub mod queries;

pub mod tracks {
    pub use super::mutations::tracks::*;
    pub use super::queries::tracks::*;
}

pub mod track_files {
    pub use super::mutations::track_files::*;
    pub use super::queries::track_files::*;
}
