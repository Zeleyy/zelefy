use rusqlite::{Connection, params};

use crate::models::playlists::NewPlaylistTrack;

pub fn add(conn: &Connection, new: &NewPlaylistTrack) -> rusqlite::Result<()> {
    conn.execute(
        r#"
            INSERT INTO playlist_tracks (playlist_id, track_id, position)
            VALUES (?1, ?2, ?3)
        "#,
        params![new.playlist_id, new.track_id, new.position],
    )?;

    Ok(())
}

pub fn add_to_end(conn: &Connection, playlist_id: i64, track_id: i64) -> rusqlite::Result<()> {
    conn.execute(
        r#"
            INSERT INTO playlist_tracks (playlist_id, track_id, position)
            VALUES (
                ?1,
                ?2,
                (
                    SELECT COALESCE(MAX(position), 0.0) + 1000.0
                    FROM playlist_tracks
                    WHERE playlist_id = ?1
                )
            )
        "#,
        params![playlist_id, track_id],
    )?;

    Ok(())
}

pub fn remove(conn: &Connection, playlist_id: i64, track_id: i64) -> rusqlite::Result<bool> {
    Ok(conn.execute(
        r#"
            DELETE FROM playlist_tracks
            WHERE playlist_id = ?1 AND track_id = ?2
        "#,
        params![playlist_id, track_id],
    )? > 0)
}

pub fn get_position(conn: &Connection, playlist_id: i64, track_id: i64) -> rusqlite::Result<f64> {
    conn.query_one(
        "SELECT position FROM playlist_tracks WHERE playlist_id = ?1 AND track_id = ?2",
        params![playlist_id, track_id],
        |row| row.get(0),
    )
}

pub fn update_position(
    conn: &Connection,
    playlist_id: i64,
    track_id: i64,
    position: f64,
) -> rusqlite::Result<bool> {
    Ok(conn.execute(
        r#"
            UPDATE playlist_tracks
            SET "position" = ?3
            WHERE playlist_id = ?1 AND track_id = ?2
        "#,
        params![playlist_id, track_id, position,],
    )? > 0)
}

pub fn reorder(conn: &Connection, playlist_id: i64) -> rusqlite::Result<()> {
    conn.execute(
        r#"
            WITH reordered AS (
                SELECT 
                    track_id,
                    ROW_NUMBER() OVER (ORDER BY position) * 1000.0 AS new_pos
                FROM playlist_tracks
                WHERE playlist_id = ?1
            )
            UPDATE playlist_tracks
            SET position = (SELECT new_pos FROM reordered WHERE reordered.track_id = playlist_tracks.track_id)
            WHERE playlist_id = ?1;
        "#,
        params![playlist_id],
    )?;

    Ok(())
}
