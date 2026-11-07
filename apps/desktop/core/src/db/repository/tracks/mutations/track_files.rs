use chrono::Utc;
use rusqlite::{Connection, params, params_from_iter, types::Value};

use crate::{
    db::utils::push_opt_nullable,
    models::tracks::{NewTrackFile, UpdateTrackFile},
};

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

pub fn update(conn: &Connection, file_id: i64, update: &UpdateTrackFile) -> rusqlite::Result<()> {
    let mut set_parts: Vec<String> = Vec::new();
    let mut values: Vec<Value> = Vec::new();

    if let Some(path) = update.path.clone() {
        set_parts.push("path = ?".to_string());
        values.push(Value::Text(path));
    }

    if let Some(size_bytes) = update.size_bytes.clone() {
        set_parts.push("size_bytes = ?".to_string());
        values.push(Value::Integer(size_bytes));
    }

    push_opt_nullable(&mut set_parts, &mut values, "library_id", update.library_id);
    push_opt_nullable(&mut set_parts, &mut values, "hash", update.hash.clone());

    if set_parts.is_empty() {
        return Ok(());
    }

    let sql = format!(
        "UPDATE track_files SET {} WHERE file_id = ?",
        set_parts.join(", ")
    );

    values.push(Value::Integer(file_id));

    let mut stmt = conn.prepare(&sql)?;
    stmt.execute(params_from_iter(values))?;

    Ok(())
}
