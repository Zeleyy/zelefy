use std::collections::HashMap;

use rusqlite::{Connection, OptionalExtension, params, params_from_iter};

use crate::{
    db::utils::placeholders,
    models::playlists::{MoveTrackRequest, NewPlaylistTrack, PlaylistTrack, PlaylistTrackCursor},
};

const POSITION_GAP: f64 = 1000.0;
const MIN_GAP: f64 = 1e-6;

pub fn get_page(
    conn: &Connection,
    playlist_id: i64,
    after: Option<PlaylistTrackCursor>,
    limit: u32,
) -> rusqlite::Result<Vec<PlaylistTrack>> {
    let mut stmt = conn.prepare_cached(
        r#"
            SELECT playlist_id, track_id, position, added_at
            FROM playlist_tracks
            WHERE playlist_id = ?1
                AND (?2 IS NULL OR position > ?2)
            ORDER BY position ASC
            LIMIT ?3
        "#,
    )?;

    stmt.query_map(
        params![playlist_id, after.map(|a| a.position), limit],
        PlaylistTrack::from_row,
    )?
    .collect()
}

pub fn get_all_track_ids(conn: &Connection, playlist_id: i64) -> rusqlite::Result<Vec<i64>> {
    let mut stmt = conn.prepare_cached(
        r#"
            SELECT track_id
            FROM playlist_tracks
            WHERE playlist_id = ?1
            ORDER BY position ASC
        "#,
    )?;

    stmt.query_map(params![playlist_id], |row| row.get(0))?
        .collect()
}

pub fn get_top_track_ids_by_playlist_ids(
    conn: &Connection,
    playlist_ids: &[i64],
    limit_per_playlist: u32,
) -> rusqlite::Result<HashMap<i64, Vec<i64>>> {
    if playlist_ids.is_empty() {
        return Ok(HashMap::new());
    }

    let sql = format!(
        r#"
            WITH ranked AS (
                SELECT
                    playlist_id,
                    track_id,
                    ROW_NUMBER() OVER (
                        PARTITION BY playlist_id
                        ORDER BY position ASC
                    ) AS rn
                FROM playlist_tracks
                WHERE playlist_id IN ({})
            )
            SELECT playlist_id, track_id
            FROM ranked
            WHERE rn <= ?{}
            ORDER BY playlist_id, rn
        "#,
        placeholders(playlist_ids.len()),
        playlist_ids.len() + 1
    );

    let mut stmt = conn.prepare(&sql)?;
    let mut rows = stmt.query(params_from_iter(
        playlist_ids
            .iter()
            .copied()
            .chain(std::iter::once(i64::from(limit_per_playlist))),
    ))?;

    let mut result: HashMap<i64, Vec<i64>> = HashMap::with_capacity(playlist_ids.len());
    while let Some(row) = rows.next()? {
        let playlist_id: i64 = row.get(0)?;
        let track_id: i64 = row.get(1)?;
        result.entry(playlist_id).or_default().push(track_id);
    }

    Ok(result)
}

pub fn add(conn: &Connection, new: &NewPlaylistTrack) -> rusqlite::Result<()> {
    conn.prepare_cached(
        r#"
            INSERT INTO playlist_tracks (playlist_id, track_id, position)
            VALUES (?1, ?2, ?3)
        "#,
    )?
    .execute(params![new.playlist_id, new.track_id, new.position])?;

    Ok(())
}

pub fn add_to_end(
    conn: &Connection,
    playlist_id: i64,
    track_id: i64,
) -> rusqlite::Result<Option<f64>> {
    conn.prepare_cached(
        r#"
            INSERT INTO playlist_tracks (playlist_id, track_id, position)
            SELECT ?1, ?2, COALESCE(MAX(position), 0.0) + ?3
            FROM playlist_tracks
            WHERE playlist_id = ?1
            ON CONFLICT (playlist_id, track_id) DO NOTHING
            RETURNING position
        "#,
    )?
    .query_row(params![playlist_id, track_id, POSITION_GAP], |row| {
        row.get(0)
    })
    .optional()
}

pub fn remove(conn: &Connection, playlist_id: i64, track_id: i64) -> rusqlite::Result<bool> {
    let changed = conn
        .prepare_cached(
            r#"
                DELETE FROM playlist_tracks
                WHERE playlist_id = ?1 AND track_id = ?2
            "#,
        )?
        .execute(params![playlist_id, track_id])?;

    Ok(changed > 0)
}

pub fn get_position(
    conn: &Connection,
    playlist_id: i64,
    track_id: i64,
) -> rusqlite::Result<Option<f64>> {
    conn.prepare_cached(
        "SELECT position FROM playlist_tracks WHERE playlist_id = ?1 AND track_id = ?2",
    )?
    .query_row(params![playlist_id, track_id], |row| row.get(0))
    .optional()
}

pub fn update_position(
    conn: &Connection,
    playlist_id: i64,
    track_id: i64,
    position: f64,
) -> rusqlite::Result<bool> {
    let changed = conn
        .prepare_cached(
            r#"
                UPDATE playlist_tracks
                SET position = ?3
                WHERE playlist_id = ?1 AND track_id = ?2
            "#,
        )?
        .execute(params![playlist_id, track_id, position])?;

    Ok(changed > 0)
}

pub fn reorder(conn: &Connection, playlist_id: i64) -> rusqlite::Result<()> {
    conn.prepare_cached(
        r#"
            WITH ordered AS (
                SELECT
                    track_id
                    , ROW_NUMBER() OVER (ORDER BY position) * ?2 AS new_pos
                FROM playlist_tracks
                WHERE playlist_id = ?1
            )
            UPDATE playlist_tracks
            SET position = ordered.new_pos
            FROM ordered
            WHERE playlist_tracks.playlist_id = ?1
                AND playlist_tracks.track_id = ordered.track_id
        "#,
    )?
    .execute(params![playlist_id, POSITION_GAP])?;

    Ok(())
}

enum Slot {
    At(f64),
    Crowded,
}

fn neighbor_after(
    conn: &Connection,
    playlist_id: i64,
    position: f64,
    moving_track_id: i64,
) -> rusqlite::Result<Option<f64>> {
    conn.prepare_cached(
        r#"
            SELECT MIN(position)
            FROM playlist_tracks
            WHERE playlist_id = ?1 AND position > ?2 AND track_id != ?3
        "#,
    )?
    .query_row(params![playlist_id, position, moving_track_id], |row| {
        row.get(0)
    })
}

fn neighbor_before(
    conn: &Connection,
    playlist_id: i64,
    position: f64,
    moving_track_id: i64,
) -> rusqlite::Result<Option<f64>> {
    conn.prepare_cached(
        r#"
            SELECT MAX(position)
            FROM playlist_tracks
            WHERE playlist_id = ?1 AND position < ?2 AND track_id != ?3
        "#,
    )?
    .query_row(params![playlist_id, position, moving_track_id], |row| {
        row.get(0)
    })
}

fn resolve_slot(
    conn: &Connection,
    playlist_id: i64,
    req: &MoveTrackRequest,
) -> rusqlite::Result<Option<Slot>> {
    let lower = match req.after_track_id {
        Some(id) => match get_position(conn, playlist_id, id)? {
            Some(position) => Some(position),
            None => return Ok(None),
        },
        None => None,
    };

    let upper = match req.before_track_id {
        Some(id) => match get_position(conn, playlist_id, id)? {
            Some(position) => Some(position),
            None => return Ok(None),
        },
        None => None,
    };

    let (lower, upper) = match (lower, upper) {
        (Some(l), None) => (Some(l), neighbor_after(conn, playlist_id, l, req.track_id)?),
        (None, Some(u)) => (
            neighbor_before(conn, playlist_id, u, req.track_id)?,
            Some(u),
        ),
        other => other,
    };

    Ok(match (lower, upper) {
        (Some(l), Some(u)) if (u - l).abs() < MIN_GAP => Some(Slot::Crowded),
        (Some(l), Some(u)) => Some(Slot::At((l + u) / 2.0)),
        (Some(l), None) => Some(Slot::At(l + POSITION_GAP)),
        (None, Some(u)) => Some(Slot::At(u - POSITION_GAP)),
        (None, None) => None,
    })
}

pub fn move_track(
    conn: &Connection,
    playlist_id: i64,
    req: &MoveTrackRequest,
) -> rusqlite::Result<bool> {
    if req.after_track_id == Some(req.track_id) || req.before_track_id == Some(req.track_id) {
        return Ok(false);
    }

    if get_position(conn, playlist_id, req.track_id)?.is_none() {
        return Ok(false);
    }

    for _ in 0..2 {
        match resolve_slot(conn, playlist_id, req)? {
            None => return Ok(false),
            Some(Slot::At(position)) => {
                return update_position(conn, playlist_id, req.track_id, position);
            }
            Some(Slot::Crowded) => reorder(conn, playlist_id)?,
        }
    }

    Ok(false)
}
