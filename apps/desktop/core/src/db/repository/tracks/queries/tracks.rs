use std::collections::HashMap;

use rusqlite::{Connection, OptionalExtension, params, params_from_iter};

use crate::models::tracks::{LocalTrackResponse, Track, TrackFileResponse, TrackFileType};

pub fn get_by_id(conn: &Connection, track_id: i64) -> rusqlite::Result<Option<Track>> {
    conn.query_one(
        r#"
            SELECT t.*
            FROM tracks t
            WHERE t.track_id = ?1
        "#,
        params![track_id],
        Track::row_to_track,
    )
    .optional()
}

pub fn get_all_local(conn: &Connection) -> rusqlite::Result<Vec<Track>> {
    let mut stmt = conn.prepare(
        r#"
            SELECT t.*
            FROM tracks t
            WHERE EXISTS (
                SELECT 1
                FROM track_files tf
                WHERE tf.track_id = t.track_id
                  AND tf.track_file_type_id = ?1
            )
            ORDER BY t.created_at DESC, t.track_id DESC;
        "#,
    )?;

    let rows = stmt.query_map(params![TrackFileType::Audio], Track::row_to_track)?;

    rows.collect()
}

pub fn get_all_local_with_files(conn: &Connection) -> rusqlite::Result<Vec<LocalTrackResponse>> {
    let tracks = get_all_local(conn)?;

    if tracks.is_empty() {
        return Ok(Vec::new());
    }

    let track_ids: Vec<i64> = tracks.iter().map(|t| t.track_id).collect();

    let placeholders = vec!["?"; track_ids.len()].join(",");
    let sql = format!(
        r#"
            SELECT
                tf.file_id, tf.track_id, tf.track_file_type_id, tf.library_id, tf.path,
                tf.is_link, tf.size_bytes, tf.hash, tf.last_accessed_at, tf.created_at
                , l.library_id AS lib_library_id
                , l.path AS lib_path
                , l.is_primary AS lib_is_primary
                , l.created_at AS lib_created_at
            FROM track_files tf
            LEFT JOIN libraries l ON tf.library_id = l.library_id
            WHERE tf.track_id IN ({})
            ORDER BY tf.track_file_type_id ASC
        "#,
        placeholders
    );

    let mut stmt = conn.prepare(&sql)?;

    let files_iter = stmt.query_map(
        params_from_iter(track_ids.iter()),
        TrackFileResponse::row_to_track_file_response,
    )?;

    let mut files_map: HashMap<i64, Vec<TrackFileResponse>> = HashMap::new();
    for file in files_iter {
        let file = file?;
        files_map
            .entry(file.track_file.track_id)
            .or_default()
            .push(file);
    }

    let result = tracks
        .into_iter()
        .map(|track| {
            let track_files = files_map.remove(&track.track_id).unwrap_or_default();
            LocalTrackResponse { track, track_files }
        })
        .collect();

    Ok(result)
}
