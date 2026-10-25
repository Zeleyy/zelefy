use rusqlite::Connection;

use crate::{db::repository, models::tracks::LocalTrackResponse, services::errors::CoreError};

pub fn get_local_tracks(conn: &Connection) -> Result<Vec<LocalTrackResponse>, CoreError> {
    let tracks = repository::tracks::tracks::get_all_local_with_files(conn)?;

    Ok(tracks)
}
