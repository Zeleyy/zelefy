use std::collections::HashMap;

use rusqlite::{Connection, params, params_from_iter};

use crate::{
    db::utils::placeholders,
    models::tracks::{TrackFile, TrackFileResponse, TrackFilesResponse},
};

const TRACK_FILES_SELECT: &str = r#"
    SELECT
        tf.file_id, tf.track_id, tf.track_file_type_id, tf.library_id, tf.path,
        tf.is_link, tf.size_bytes, tf.hash, tf.last_accessed_at, tf.created_at,
        l.library_id AS lib_library_id,
        l.path AS lib_path,
        l.is_primary AS lib_is_primary,
        l.created_at AS lib_created_at
    FROM track_files tf
    LEFT JOIN libraries l ON tf.library_id = l.library_id
"#;

pub fn load_files_map(
    conn: &Connection,
    track_ids: &[i64],
) -> rusqlite::Result<HashMap<i64, Vec<TrackFileResponse>>> {
    if track_ids.is_empty() {
        return Ok(HashMap::new());
    }

    let sql = format!(
        "{} WHERE tf.track_id IN ({}) ORDER BY tf.track_file_type_id ASC",
        TRACK_FILES_SELECT,
        placeholders(track_ids.len())
    );

    let mut stmt = conn.prepare(&sql)?;
    let files_iter = stmt.query_map(
        params_from_iter(track_ids.iter()),
        TrackFileResponse::from_row,
    )?;

    let mut map: HashMap<i64, Vec<TrackFileResponse>> = HashMap::new();
    for file in files_iter {
        let file = file?;
        map.entry(file.track_file.track_id).or_default().push(file);
    }
    Ok(map)
}

pub fn get_by_track_id(conn: &Connection, track_id: i64) -> rusqlite::Result<Vec<TrackFile>> {
    let mut stmt = conn.prepare(
        r#"
            SELECT tf.*
            FROM track_files tf
            WHERE tf.track_id = ?1
        "#,
    )?;

    let rows = stmt.query_map(params![track_id], TrackFile::from_row)?;

    rows.collect()
}

pub fn get_by_track_id_with_library(
    conn: &Connection,
    track_id: i64,
) -> rusqlite::Result<Vec<TrackFileResponse>> {
    let mut stmt = conn.prepare(
        r#"
            SELECT
                tf.*
                , l.library_id AS lib_library_id
                , l.path AS lib_path
                , l.is_primary AS lib_is_primary
                , l.created_at AS lib_created_at
            FROM track_files tf
            LEFT JOIN libraries l ON l.library_id = tf.library_id
            WHERE tf.track_id = ?1
        "#,
    )?;

    let rows = stmt.query_map(params![track_id], TrackFileResponse::from_row)?;

    rows.collect()
}

pub fn get_map_by_track_id(
    conn: &Connection,
    track_id: i64,
) -> rusqlite::Result<TrackFilesResponse> {
    let rows = get_by_track_id_with_library(conn, track_id)?;
    Ok(TrackFilesResponse::from_rows(rows))
}
