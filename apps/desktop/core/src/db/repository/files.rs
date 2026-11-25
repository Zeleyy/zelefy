use rusqlite::{Connection, params, params_from_iter, types::Value};

use crate::{
    db::utils::push_opt_nullable,
    models::files::{NewFile, UpdateFile},
};

pub fn create(conn: &Connection, new: &NewFile) -> rusqlite::Result<i64> {
    conn.query_one(
        r#"
            INSERT INTO
                files (
                    file_type_id
                    , library_id
                    , path
                    , is_link
                    , size_bytes
                    , hash
                )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)
            RETURNING file_id
        "#,
        params![
            new.file_type,
            new.library_id,
            new.path,
            new.is_link,
            new.size_bytes,
            new.hash
        ],
        |row| row.get(0),
    )
}

pub fn update(conn: &Connection, file_id: i64, update: &UpdateFile) -> rusqlite::Result<()> {
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
        "UPDATE files SET {} WHERE file_id = ?",
        set_parts.join(", ")
    );

    values.push(Value::Integer(file_id));

    let mut stmt = conn.prepare(&sql)?;
    stmt.execute(params_from_iter(values))?;

    Ok(())
}

pub fn delete(conn: &Connection, file_id: i64) -> rusqlite::Result<bool> {
    Ok(conn.execute("DELETE FROM files WHERE file_id = ?1", params![file_id])? > 0)
}

pub fn delete_by_track_id(conn: &Connection, track_id: i64) -> rusqlite::Result<bool> {
    Ok(conn.execute(
        r#"
                DELETE FROM files
                WHERE file_id IN (
                    SELECT file_id
                    FROM track_files
                    WHERE track_id = ?1
                )
            "#,
        params![track_id],
    )? > 0)
}
