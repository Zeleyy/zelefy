use rusqlite::Connection;

use crate::{db::repository, models::tracks::LocalTrack, services::errors::CoreError};

pub fn get_local_tracks(conn: &Connection) -> Result<Vec<LocalTrack>, CoreError> {
    Ok(repository::tracks::get_all(conn)?)
}
