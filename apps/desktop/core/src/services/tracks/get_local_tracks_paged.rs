use rusqlite::Connection;

use crate::{
    db::repository::{self, tracks::track_files::load_files_map},
    models::{
        tracks::{LocalTrackCursor, LocalTrackIdResponse, TrackFilesResponse},
        utils::SearchQuery,
    },
    services::errors::CoreError,
};

pub fn get_local_tracks_paged(
    conn: &mut Connection,
    search: Option<&SearchQuery>,
    after: Option<LocalTrackCursor>,
    limit: u32,
) -> Result<Vec<LocalTrackIdResponse>, CoreError> {
    let tx = conn.transaction()?;

    let track_ids = repository::tracks::tracks::get_local_ids_page(&tx, search, after, limit)?;

    let mut files_map = load_files_map(&tx, &track_ids)?;

    Ok(track_ids
        .into_iter()
        .map(|track_id| {
            let files = files_map.remove(&track_id).unwrap_or_default();
            LocalTrackIdResponse {
                track_id,
                track_files: TrackFilesResponse::from_rows(files),
            }
        })
        .collect())
}
