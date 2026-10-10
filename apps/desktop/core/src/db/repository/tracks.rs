use rusqlite::{Connection, OptionalExtension, params};
use zelefy_common::tracks::TrackWithStats;

use crate::models::tracks::{LocalTrack, NewLocalTrack};

pub fn get_by_id(conn: &Connection, track_id: i64) -> rusqlite::Result<Option<LocalTrack>> {
    conn.query_row(
        r#"
            SELECT 
                track_id, file_id, remote_track_id, profile_id,
                title, permalink, audio_url, cover_url, waveform_url, duration_seconds,
                genre, description, bpm, key_signature, is_private,
                status_id, processing_error,
                plays_count, likes_count, reposts_count, comments_count,
                created_at, updated_at
            FROM local_tracks
            WHERE track_id = ?1
        "#,
        params![track_id],
        LocalTrack::row_to_track,
    )
    .optional()
}

pub fn insert_local(conn: &Connection, track: &NewLocalTrack) -> rusqlite::Result<i64> {
    conn.execute(
        r#"
            INSERT INTO local_tracks (
                file_id, title, permalink, duration_seconds, 
                genre, description, is_private, created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            "#,
        params![
            track.file_id,
            track.title,
            track.permalink,
            track.duration_seconds,
            track.genre,
            track.description,
            track.is_private,
            chrono::Utc::now().timestamp(),
        ],
    )?;

    Ok(conn.last_insert_rowid())
}

pub fn upsert_from_server(
    conn: &Connection,
    track: &TrackWithStats,
    file_id: Option<i64>,
    profile_id: i64,
) -> rusqlite::Result<()> {
    conn.execute(
        r#"
            INSERT INTO local_tracks (
                file_id, remote_track_id, profile_id, title, permalink, 
                audio_url, cover_url, waveform_url, duration_seconds, 
                genre, description, bpm, key_signature, is_private, 
                status_id, processing_error, plays_count, likes_count, 
                reposts_count, comments_count, created_at, updated_at
            ) VALUES (
                ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 
                ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22
            )
            ON CONFLICT(remote_track_id) DO UPDATE SET
                title = excluded.title,
                audio_url = excluded.audio_url,
                cover_url = excluded.cover_url,
                plays_count = excluded.plays_count,
                likes_count = excluded.likes_count,
                updated_at = excluded.updated_at
            "#,
        params![
            file_id,
            track.track_id,
            profile_id,
            track.title,
            track.permalink,
            track.audio_url,
            track.cover_url,
            track.waveform_url,
            track.duration_seconds,
            track.genre,
            track.description,
            track.bpm,
            track.key_signature,
            track.is_private,
            track.status as u8,
            track.processing_error,
            track.plays_count,
            track.likes_count,
            track.reposts_count,
            track.comments_count,
            track.created_at.timestamp(),
            track.updated_at.timestamp(),
        ],
    )?;
    Ok(())
}
