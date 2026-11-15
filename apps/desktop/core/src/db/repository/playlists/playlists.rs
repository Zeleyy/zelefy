use rusqlite::{Connection, params, params_from_iter, types::Value};

use crate::{
    db::utils::push_opt_nullable,
    models::playlists::{NewPlaylist, Playlist, UpdatePlaylist},
};

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

pub fn create(conn: &Connection, new: &NewPlaylist) -> rusqlite::Result<i64> {
    conn.query_one(
        r#"
            INSERT INTO playlists (title, description)
            VALUES (?1, ?2)
            RETURNING playlist_id
        "#,
        params![new.title, new.description],
        |row| row.get("playlist_id"),
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
