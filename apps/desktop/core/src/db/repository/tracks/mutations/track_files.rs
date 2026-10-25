use chrono::Utc;
use rusqlite::{Connection, params};

use crate::models::tracks::NewTrackFile;

pub fn create(conn: &Connection, track_file: &NewTrackFile) -> rusqlite::Result<i64> {
    let now = Utc::now().timestamp();

    conn.query_one(
        r#"
            INSERT INTO
                track_files (
                    track_id
                    , track_file_type_id
                    , library_id
                    , path
                    , is_link
                    , size_bytes
                    , hash
                    , last_accessed_at
                    , created_at
                )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?8)
            RETURNING file_id
        "#,
        params![
            track_file.track_id,
            track_file.track_file_type,
            track_file.library_id,
            track_file.path,
            track_file.is_link,
            track_file.size_bytes,
            track_file.hash,
            now
        ],
        |row| row.get(0),
    )
}
