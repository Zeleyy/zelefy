use chrono::Utc;
use rusqlite::{Connection, params, params_from_iter, types::Value};

use crate::models::storages::{NewStorage, Storage, UpdateStorage};

pub fn get_all(conn: &Connection) -> rusqlite::Result<Vec<Storage>> {
    let mut stmt = conn.prepare(
        r#"
            SELECT
                storage_id
                , path
                , storage_type_id
                , is_primary
                , max_size_bytes
                , created_at
            FROM storages
        "#,
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Storage {
            storage_id: row.get(0)?,
            path: row.get(1)?,
            storage_type: row.get(2)?,
            is_primary: row.get(3)?,
            max_size_bytes: row.get(4)?,
            created_at: row.get(5)?,
        })
    })?;

    rows.collect()
}

pub fn create(conn: &Connection, new: &NewStorage) -> rusqlite::Result<i64> {
    conn.query_row(
        r#"
            INSERT INTO storages (path, storage_type_id, is_primary, max_size_bytes, created_at)
            VALUES (?1, ?2, ?3, ?4, ?5)
            RETURNING storage_id
        "#,
        params![
            new.path,
            new.storage_type as u8,
            new.is_primary,
            new.max_size_bytes,
            Utc::now().timestamp(),
        ],
        |row| row.get(0),
    )
}

pub fn update(conn: &Connection, storage_id: i64, update: &UpdateStorage) -> rusqlite::Result<()> {
    let mut set_parts: Vec<String> = Vec::new();
    let mut values: Vec<Value> = Vec::new();

    if let Some(path) = &update.path {
        set_parts.push("path = ?".to_string());
        values.push(Value::Text(path.clone()));
    }

    if let Some(is_primary) = update.is_primary {
        set_parts.push("is_primary = ?".to_string());
        values.push(Value::Integer(is_primary as i64));
    }

    if let Some(max_size) = update.max_size_bytes {
        set_parts.push("max_size_bytes = ?".to_string());
        values.push(match max_size {
            Some(v) => Value::Integer(v),
            None => Value::Null,
        });
    }

    if set_parts.is_empty() {
        return Ok(());
    }

    let sql = format!(
        "UPDATE storages SET {} WHERE storage_id = ?",
        set_parts.join(", ")
    );

    values.push(Value::Integer(storage_id));

    let mut stmt = conn.prepare(&sql)?;
    stmt.execute(params_from_iter(values))?;

    Ok(())
}

pub fn delete(conn: &Connection, storage_id: i64) -> rusqlite::Result<()> {
    conn.execute(
        r#"
            DELETE FROM storages
            WHERE storage_id = ?1
        "#,
        params![storage_id],
    )?;

    Ok(())
}
