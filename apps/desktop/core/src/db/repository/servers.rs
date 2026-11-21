use rusqlite::{Connection, OptionalExtension, params};

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
            INSERT INTO (server_name, server_url)
            VALUES (?1, ?2)
            RETURNING server_id
        "#,
        params![new.server_name, new.server_url],
        |row| row.get(0),
    )
}

pub fn set_active(conn: &Connection, server_id: i64) -> rusqlite::Result<bool> {
    Ok(conn.execute(
        r#"
            UPDATE servers
            SET is_active = (server_id = ?1)
            WHERE is_active = 1 OR server_id = ?1
        "#,
        params![server_id],
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
