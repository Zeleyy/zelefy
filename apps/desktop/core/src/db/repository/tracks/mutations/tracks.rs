use chrono::Utc;
use rusqlite::{Connection, params, params_from_iter, types::Value};

use crate::{
    db::utils::push_opt_nullable,
    models::tracks::{NewTrack, UpdateTrack},
};

pub fn create(conn: &Connection, track: &NewTrack) -> rusqlite::Result<i64> {
    conn.query_one(
        r#"
            INSERT INTO
                tracks (
                    title
                    , local_uuid
                    , metadata_artist
                    , duration_ms
                    , genre
                    , bpm
                    , key_signature
                    , description
                    , created_at
                )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            RETURNING track_id
        "#,
        params![
            track.title,
            track.local_uuid,
            track.metadata_artist,
            track.duration_ms,
            track.genre,
            track.bpm,
            track.key_signature,
            track.description,
            Utc::now().timestamp()
        ],
        |row| row.get(0),
    )
}

pub fn update(conn: &Connection, track_id: i64, update: &UpdateTrack) -> rusqlite::Result<usize> {
    let mut set_parts: Vec<String> = Vec::new();
    let mut values: Vec<Value> = Vec::new();

    if let Some(title) = &update.title {
        set_parts.push("title = ?".to_string());
        values.push(Value::Text(title.clone()));
    }

    push_opt_nullable(
        &mut set_parts,
        &mut values,
        "metadata_artist",
        update.metadata_artist.clone(),
    );
    push_opt_nullable(&mut set_parts, &mut values, "genre", update.genre.clone());
    push_opt_nullable(&mut set_parts, &mut values, "bpm", update.bpm.clone());
    push_opt_nullable(
        &mut set_parts,
        &mut values,
        "key_signature",
        update.key_signature.clone(),
    );
    push_opt_nullable(
        &mut set_parts,
        &mut values,
        "description",
        update.description.clone(),
    );

    if set_parts.is_empty() {
        return Ok(0);
    }

    let sql = format!(
        "UPDATE tracks SET {} WHERE track_id = ?",
        set_parts.join(", ")
    );

    values.push(Value::Integer(track_id));

    let mut stmt = conn.prepare(&sql)?;
    stmt.execute(params_from_iter(values))
}

pub fn delete(conn: &Connection, track_id: i64) -> rusqlite::Result<i64> {
    conn.query_one(
        r#"
            DELETE FROM tracks
            WHERE track_id = ?1
            RETURNING track_id
        "#,
        params![track_id],
        |row| row.get(0),
    )
}
