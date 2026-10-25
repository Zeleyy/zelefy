use chrono::Utc;
use rusqlite::{Connection, params};

use crate::models::tracks::NewTrack;

pub fn create(conn: &Connection, track: &NewTrack) -> rusqlite::Result<i64> {
    conn.query_one(
        r#"
            INSERT INTO
                tracks (
                    title
                    , metadata_artist
                    , duration_seconds
                    , genre
                    , bpm
                    , key_signature
                    , description
                    , created_at
                )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            RETURNING track_id
        "#,
        params![
            track.title,
            track.metadata_artist,
            track.duration_seconds,
            track.genre,
            track.bpm,
            track.key_signature,
            track.description,
            Utc::now().timestamp()
        ],
        |row| row.get(0),
    )
}
