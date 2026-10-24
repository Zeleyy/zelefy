use chrono::Utc;
use rusqlite::{Connection, params};

use crate::models::local_files::NewLocalFile;

pub fn create(conn: &Connection, new: &NewLocalFile) -> rusqlite::Result<i64> {
    let now = Utc::now().timestamp();
    conn.query_row(
        r#"
            INSERT INTO local_files (
                library_id, file_path, is_link, file_hash,
                file_size_bytes, last_accessed_at, created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)
            RETURNING file_id
        "#,
        params![
            new.library_id,
            new.file_path,
            new.is_link,
            new.file_hash,
            new.file_size_bytes,
            now,
        ],
        |row| row.get(0),
    )
}
