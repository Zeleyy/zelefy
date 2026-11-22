use rusqlite::{Connection, OptionalExtension, Transaction, params};

use crate::models::servers::{NewServer, Server};

pub fn get_all(conn: &Connection) -> rusqlite::Result<Vec<Server>> {
    let mut stmt = conn.prepare_cached(
        r#"
        SELECT
            server_id
            , server_name
            , server_url
            , is_active
            , created_at
        FROM servers
    "#,
    )?;

    let rows = stmt.query_map([], Server::from_row)?;

    rows.collect()
}

pub fn get_by_url(conn: &Connection, url: &str) -> rusqlite::Result<Option<Server>> {
    conn.query_one(
        r#"
            SELECT
                server_id
                , server_name
                , server_url
                , is_active
                , created_at
            FROM servers
            WHERE server_url = ?1
        "#,
        params![url],
        Server::from_row,
    )
    .optional()
}

pub fn get_active(conn: &Connection) -> rusqlite::Result<Option<Server>> {
    conn.query_one(
        r#"
            SELECT
                server_id
                , server_name
                , server_url
                , is_active
                , created_at
            FROM servers
            WHERE is_active = 1
        "#,
        [],
        Server::from_row,
    )
    .optional()
}

pub fn create(conn: &Connection, new: NewServer) -> rusqlite::Result<i64> {
    conn.query_one(
        r#"
            INSERT INTO servers (server_name, server_url)
            VALUES (?1, ?2)
            RETURNING server_id
        "#,
        params![new.server_name, new.server_url],
        |row| row.get(0),
    )
}

pub fn set_active(tx: &Transaction, server_id: i64) -> rusqlite::Result<bool> {
    deactivate_others(tx, server_id)?;
    Ok(activate(&tx, server_id)? > 0)
}

fn deactivate_others(conn: &Connection, keep_id: i64) -> rusqlite::Result<usize> {
    conn.execute(
        "UPDATE servers SET is_active = 0 WHERE is_active = 1 AND server_id != ?1",
        params![keep_id],
    )
}

fn activate(conn: &Connection, server_id: i64) -> rusqlite::Result<usize> {
    conn.execute(
        "UPDATE servers SET is_active = 1 WHERE server_id = ?1 AND is_active = 0",
        params![server_id],
    )
}

pub fn set_name(conn: &Connection, server_id: i64, new_name: &str) -> rusqlite::Result<bool> {
    Ok(conn.execute(
        r#"
            UPDATE servers
            SET server_name = ?2
            WHERE server_id = ?1
        "#,
        params![server_id, new_name],
    )? > 0)
}

pub fn delete(conn: &Connection, server_id: i64) -> rusqlite::Result<bool> {
    Ok(conn.execute(
        r#"
            DELETE FROM servers
            WHERE server_id = ?1
        "#,
        params![server_id],
    )? > 0)
}
