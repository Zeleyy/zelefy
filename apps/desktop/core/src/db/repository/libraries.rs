use chrono::Utc;
use rusqlite::{Connection, OptionalExtension, params, params_from_iter, types::Value};

use crate::models::libraries::{Library, NewLibrary, UpdateLibrary};

pub fn get_by_id(conn: &Connection, library_id: i64) -> rusqlite::Result<Library> {
    conn.query_one(
        r#"
            SELECT
                library_id
                , path
                , is_primary
                , created_at
            FROM libraries
            WHERE library_id = ?1
        "#,
        params![library_id],
        |row| {
            Ok(Library {
                library_id: row.get(0)?,
                path: row.get(1)?,
                is_primary: row.get(2)?,
                created_at: row.get(3)?,
            })
        },
    )
}

pub fn get_all(conn: &Connection) -> rusqlite::Result<Vec<Library>> {
    let mut stmt = conn.prepare(
        r#"
            SELECT
                library_id
                , path
                , is_primary
                , created_at
            FROM libraries
            ORDER BY
                is_primary DESC
                , created_at ASC
        "#,
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Library {
            library_id: row.get(0)?,
            path: row.get(1)?,
            is_primary: row.get(2)?,
            created_at: row.get(3)?,
        })
    })?;

    rows.collect()
}

pub fn get_by(
    conn: &Connection,
    path: Option<String>,
    is_primary: Option<bool>,
) -> rusqlite::Result<Vec<Library>> {
    let mut where_parts: Vec<String> = Vec::new();
    let mut values: Vec<Value> = Vec::new();

    if let Some(p) = path {
        where_parts.push("path = ?".to_string());
        values.push(Value::Text(p));
    }

    if let Some(ip) = is_primary {
        where_parts.push("is_primary = ?".to_string());
        values.push(Value::Integer(ip as i64));
    }

    let mut sql = String::from(
        r#"
            SELECT
                library_id
                , path
                , is_primary
                , created_at
            FROM libraries
        "#,
    );

    if !where_parts.is_empty() {
        sql.push_str(" WHERE ");
        sql.push_str(&where_parts.join(" AND "));
    }

    let mut stmt = conn.prepare(&sql)?;

    let rows = stmt.query_map(params_from_iter(values), |row| {
        Ok(Library {
            library_id: row.get(0)?,
            path: row.get(1)?,
            is_primary: row.get::<_, i64>(2)? != 0,
            created_at: row.get(4)?,
        })
    })?;

    rows.collect()
}

pub fn create(conn: &Connection, new: &NewLibrary) -> rusqlite::Result<i64> {
    conn.query_row(
        r#"
            INSERT INTO libraries (path, is_primary, created_at)
            VALUES (?1, ?2, ?3)
            RETURNING library_id
        "#,
        params![new.path, new.is_primary, Utc::now().timestamp(),],
        |row| row.get(0),
    )
}

pub fn update(conn: &Connection, library_id: i64, update: &UpdateLibrary) -> rusqlite::Result<()> {
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

    if set_parts.is_empty() {
        return Ok(());
    }

    let sql = format!(
        "UPDATE libraries SET {} WHERE library_id = ?",
        set_parts.join(", ")
    );

    values.push(Value::Integer(library_id));

    let mut stmt = conn.prepare(&sql)?;
    stmt.execute(params_from_iter(values))?;

    Ok(())
}

pub fn delete(conn: &Connection, library_id: i64) -> rusqlite::Result<()> {
    conn.execute(
        r#"
            DELETE FROM libraries
            WHERE library_id = ?1
        "#,
        params![library_id],
    )?;

    Ok(())
}

pub fn get_primary(conn: &Connection) -> rusqlite::Result<Option<Library>> {
    conn.query_row(
        "SELECT library_id, path, is_primary, created_at
         FROM libraries WHERE is_primary = 1 LIMIT 1",
        [],
        |row| {
            Ok(Library {
                library_id: row.get(0)?,
                path: row.get(1)?,
                is_primary: row.get(2)?,
                created_at: row.get(3)?,
            })
        },
    )
    .optional()
}

pub fn clear_primary(conn: &Connection, except_id: Option<i64>) -> rusqlite::Result<()> {
    match except_id {
        Some(id) => conn.execute(
            "UPDATE libraries SET is_primary = 0 WHERE is_primary = 1 AND library_id != ?1",
            params![id],
        )?,
        None => conn.execute(
            "UPDATE libraries SET is_primary = 0 WHERE is_primary = 1",
            [],
        )?,
    };
    Ok(())
}
