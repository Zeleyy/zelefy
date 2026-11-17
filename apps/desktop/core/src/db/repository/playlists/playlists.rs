use rusqlite::{Connection, OptionalExtension, params, params_from_iter, types::Value};

use crate::{
    db::utils::push_opt_nullable,
    models::playlists::{NewPlaylist, Playlist, PlaylistWithFirstTrackId, UpdatePlaylist},
};

pub fn get_by_id(conn: &Connection, playlist_id: i64) -> rusqlite::Result<Option<Playlist>> {
    conn.query_one(
        r#"
            SELECT
                playlist_id
                , title
                , description
                , created_at
            FROM playlists
            WHERE playlist_id = ?1
        "#,
        params![playlist_id],
        Playlist::from_row,
    )
    .optional()
}

pub fn get_all(conn: &Connection) -> rusqlite::Result<Vec<Playlist>> {
    let mut stmt = conn.prepare_cached(
        r#"
            SELECT
                playlist_id
                , title
                , description
                , created_at
            FROM playlists
            ORDER BY
                created_at ASC
        "#,
    )?;

    let rows = stmt.query_map([], |row| Playlist::from_row(row))?;

    rows.collect()
}

pub fn get_all_with_first_track_id(
    conn: &Connection,
) -> rusqlite::Result<Vec<PlaylistWithFirstTrackId>> {
    let mut stmt = conn.prepare_cached(
        r#"
            SELECT
                p.playlist_id
                , p.title
                , p.description
                , p.created_at
                , (
                    SELECT pt.track_id
                    FROM playlist_tracks pt
                    WHERE pt.playlist_id = p.playlist_id  
                    ORDER BY pt.position ASC
                    LIMIT 1
                ) AS track_id
            FROM playlists p
            ORDER BY p.created_at ASC
        "#,
    )?;

    let rows = stmt.query_map([], |row| PlaylistWithFirstTrackId::from_row(row))?;

    rows.collect()
}

pub fn create(conn: &Connection, new: &NewPlaylist) -> rusqlite::Result<Playlist> {
    conn.query_one(
        r#"
            INSERT INTO playlists (title, description)
            VALUES (?1, ?2)
            RETURNING playlist_id, title, description, created_at
        "#,
        params![new.title, new.description],
        Playlist::from_row,
    )
}

pub fn update(
    conn: &Connection,
    playlist_id: i64,
    update: &UpdatePlaylist,
) -> rusqlite::Result<()> {
    let mut set_parts: Vec<String> = Vec::new();
    let mut values: Vec<Value> = Vec::new();

    if let Some(title) = &update.title {
        set_parts.push("title = ?".to_string());
        values.push(Value::Text(title.clone()));
    }

    push_opt_nullable(
        &mut set_parts,
        &mut values,
        "description",
        update.description.clone(),
    );

    if set_parts.is_empty() {
        return Ok(());
    }

    let sql = format!(
        "UPDATE playlists SET {} WHERE playlist_id = ?",
        set_parts.join(", ")
    );

    values.push(Value::Integer(playlist_id));

    let mut stmt = conn.prepare(&sql)?;
    stmt.execute(params_from_iter(values))?;

    Ok(())
}

pub fn delete(conn: &Connection, playlist_id: i64) -> rusqlite::Result<bool> {
    Ok(conn.execute(
        r#"
            DELETE FROM playlists
            WHERE playlist_id = ?1
        "#,
        params![playlist_id],
    )? > 0)
}
