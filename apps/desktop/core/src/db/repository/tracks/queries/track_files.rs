use rusqlite::{Connection, params};

use crate::models::tracks::{TrackFile, TrackFileResponse};

pub fn get_by_track_id(conn: &Connection, track_id: i64) -> rusqlite::Result<Vec<TrackFile>> {
    let mut stmt = conn.prepare(
        r#"
            SELECT tf.*
            FROM track_files tf
            WHERE tf.track_id = ?1
        "#,
    )?;

    let rows = stmt.query_map(params![track_id], TrackFile::row_to_track_file)?;

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

    let rows = stmt.query_map(
        params![track_id],
        TrackFileResponse::row_to_track_file_response,
    )?;

    rows.collect()
}
