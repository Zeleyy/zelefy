use rusqlite::{Connection, params, params_from_iter};
use std::collections::HashMap;

use crate::{
    db::utils::placeholders,
    models::tracks::{TrackFile, TrackFileWithPath, TrackFilesWithPath},
};

pub fn load_files_map(
    conn: &Connection,
    track_ids: &[i64],
) -> rusqlite::Result<HashMap<i64, Vec<TrackFileWithPath>>> {
    if track_ids.is_empty() {
        return Ok(HashMap::new());
    }

    let sql = format!(
        r#"
            SELECT
                tf.track_id
                , tf.file_id
                , tf.file_type_id
                , vfr.library_id
                , vfr.is_link
                , vfr.size_bytes
                , vfr.full_path
            FROM track_files tf
            JOIN v_files_resolved vfr ON vfr.file_id = tf.file_id
            WHERE tf.track_id IN ({})
            ORDER BY tf.file_type_id ASC
        "#,
        placeholders(track_ids.len())
    );

    let mut stmt = conn.prepare(&sql)?;
    let files_iter = stmt.query_map(
        params_from_iter(track_ids.iter()),
        TrackFileWithPath::from_row,
    )?;

    let mut map: HashMap<i64, Vec<TrackFileWithPath>> = HashMap::new();
    for file in files_iter {
        let file = file?;
        map.entry(file.track_file.track_id).or_default().push(file);
    }
    Ok(map)
}

pub fn get_by_track_id(conn: &Connection, track_id: i64) -> rusqlite::Result<Vec<TrackFile>> {
    let mut stmt = conn.prepare(
        r#"
            SELECT track_id, file_id, file_type_id
            FROM track_files
            WHERE track_id = ?1
        "#,
    )?;

    let rows = stmt.query_map(params![track_id], TrackFile::from_row)?;

    rows.collect()
}

pub fn get_by_track_id_with_path(
    conn: &Connection,
    track_id: i64,
) -> rusqlite::Result<Vec<TrackFileWithPath>> {
    let mut stmt = conn.prepare(
        r#"
            SELECT
                tf.track_id
                , tf.file_id
                , tf.file_type_id
                , vfr.full_path
                , vfr.is_link
                , vfr.size_bytes
                , vfr.library_id
            FROM track_files tf
            JOIN v_files_resolved vfr ON vfr.file_id = tf.file_id
            WHERE tf.track_id = ?1
        "#,
    )?;

    let rows = stmt.query_map(params![track_id], TrackFileWithPath::from_row)?;

    rows.collect()
}

pub fn get_by_track_id_with_paths(
    conn: &Connection,
    track_id: i64,
) -> rusqlite::Result<TrackFilesWithPath> {
    let rows = get_by_track_id_with_path(conn, track_id)?;
    Ok(TrackFilesWithPath::from_rows(rows))
}
