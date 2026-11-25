use rusqlite::{Connection, params};

use crate::models::tracks::NewTrackFile;

pub fn create(conn: &Connection, new: &NewTrackFile) -> rusqlite::Result<i64> {
    conn.query_one(
        r#"
            INSERT INTO
                track_files (
                    track_id
                    , file_id
                    , file_type_id
                )
            VALUES (?1, ?2, ?3)
            RETURNING track_id
        "#,
        params![new.track_id, new.file_id, new.file_type],
        |row| row.get(0),
    )
}
