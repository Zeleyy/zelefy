use rusqlite::Connection;

pub mod get_local_tracks;
pub mod import_tracks;

pub use get_local_tracks::*;
pub use import_tracks::*;

use crate::{db::repository, models::tracks::LocalTrackResponse, services::errors::CoreError};

pub fn load_track(conn: &Connection, track_id: i64) -> Result<LocalTrackResponse, CoreError> {
    let track = repository::tracks::tracks::get_by_id(conn, track_id)?
        .ok_or(CoreError::NotFound(track_id))?;
    let track_files =
        repository::tracks::track_files::get_by_track_id_with_library(conn, track_id)?;
    Ok(LocalTrackResponse { track, track_files })
}
