use rusqlite::{Connection, OptionalExtension, params, params_from_iter};
use std::collections::HashMap;

use crate::{
    db::utils::placeholders,
    models::tracks::{
        LocalTrackIdResponse, LocalTrackResponse, Track, TrackFileResponse, TrackFileType,
        TrackFilesResponse,
    },
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

pub fn get_by_id(conn: &Connection, track_id: i64) -> rusqlite::Result<Option<Track>> {
    conn.query_one(
        r#"
            SELECT t.*
            FROM tracks t
            WHERE t.track_id = ?1
        "#,
        params![track_id],
        Track::from_row,
    )
    .optional()
}

fn load_files_map(
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

fn attach_files(
    tracks: Vec<Track>,
    mut files_map: HashMap<i64, Vec<TrackFileResponse>>,
) -> Vec<LocalTrackResponse> {
    tracks
        .into_iter()
        .map(|track| {
            let files = files_map.remove(&track.track_id).unwrap_or_default();
            LocalTrackResponse {
                track,
                track_files: TrackFilesResponse::from_rows(files),
            }
        })
        .collect()
}

pub fn get_local_by_id_with_files(
    conn: &Connection,
    track_id: i64,
) -> rusqlite::Result<Option<LocalTrackResponse>> {
    let Some(track) = get_by_id(conn, track_id)? else {
        return Ok(None);
    };
    let files_map = load_files_map(conn, &[track_id])?;
    Ok(attach_files(vec![track], files_map).pop())
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

    let rows = stmt.query_map(params![TrackFileType::Audio], Track::from_row)?;

    rows.collect()
}

pub fn get_all_local_with_files(conn: &Connection) -> rusqlite::Result<Vec<LocalTrackResponse>> {
    let tracks = get_all_local(conn)?;
    let ids: Vec<i64> = tracks.iter().map(|t| t.track_id).collect();
    let files_map = load_files_map(conn, &ids)?;
    Ok(attach_files(tracks, files_map))
}

pub fn get_by_ids(conn: &Connection, track_ids: Vec<i64>) -> rusqlite::Result<Vec<Track>> {
    if track_ids.is_empty() {
        return Ok(Vec::new());
    }
    let sql = format!(
        "SELECT t.* FROM tracks t WHERE t.track_id IN ({})",
        placeholders(track_ids.len())
    );
    let mut stmt = conn.prepare(&sql)?;
    stmt.query_map(params_from_iter(track_ids.iter()), Track::from_row)?
        .collect()
}

pub fn get_local_by_ids_with_files(
    conn: &Connection,
    track_ids: Vec<i64>,
) -> rusqlite::Result<Vec<LocalTrackResponse>> {
    let tracks = get_by_ids(conn, track_ids)?;
    let ids: Vec<i64> = tracks.iter().map(|t| t.track_id).collect();
    let files_map = load_files_map(conn, &ids)?;
    Ok(attach_files(tracks, files_map))
}

pub fn get_local_ids(conn: &Connection) -> rusqlite::Result<Vec<i64>> {
    let mut stmt = conn.prepare(
        r#"
            SELECT t.track_id
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

    let rows = stmt.query_map(params![TrackFileType::Audio], |row| row.get("track_id"))?;

    rows.collect()
}

pub fn get_local_ids_with_files(conn: &Connection) -> rusqlite::Result<Vec<LocalTrackIdResponse>> {
    let track_ids = get_local_ids(conn)?;

    if track_ids.is_empty() {
        return Ok(Vec::new());
    }

    let mut files_map = load_files_map(conn, &track_ids)?;

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
