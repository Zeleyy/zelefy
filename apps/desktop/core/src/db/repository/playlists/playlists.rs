use rusqlite::{Connection, OptionalExtension, ToSql, params, params_from_iter, types::Value};

use crate::{
    db::{
        repository::playlists::playlist_tracks::get_top_track_ids_by_playlist_ids,
        utils::push_opt_nullable,
    },
    models::{
        playlists::{
            NewPlaylist, Playlist, PlaylistCursor, PlaylistRow, PlaylistWithFirstTrackId,
            PlaylistWithFirstTrackIds, UpdatePlaylist,
        },
        utils::SearchQuery,
    },
};

const PREVIEW_TRACKS_LIMIT: usize = 5;

macro_rules! playlist_columns {
    () => {
        "p.playlist_id, p.title, p.description, p.created_at, vfr.full_path AS cover_path"
    };
}

macro_rules! playlist_from {
    () => {
        "FROM playlists p
         LEFT JOIN v_files_resolved vfr ON vfr.file_id = p.cover_file_id"
    };
}

macro_rules! cover_join {
    () => {
        "LEFT JOIN v_files_resolved vfr ON vfr.file_id = p.cover_file_id"
    };
}

macro_rules! first_track_id {
    () => {
        r#"(
            SELECT pt.track_id
            FROM playlist_tracks pt
            WHERE pt.playlist_id = p.playlist_id
            ORDER BY pt.position ASC
            LIMIT 1
        ) AS track_id"#
    };
}

pub fn get_by_id(conn: &Connection, playlist_id: i64) -> rusqlite::Result<Option<Playlist>> {
    conn.prepare_cached(concat!(
        "SELECT ",
        playlist_columns!(),
        " ",
        playlist_from!(),
        " WHERE p.playlist_id = ?1"
    ))?
    .query_row(params![playlist_id], Playlist::from_row)
    .optional()
}

pub fn get_all(conn: &Connection) -> rusqlite::Result<Vec<Playlist>> {
    let mut stmt = conn.prepare_cached(concat!(
        "SELECT ",
        playlist_columns!(),
        " ",
        playlist_from!(),
        " ORDER BY p.created_at ASC"
    ))?;
    stmt.query_map([], Playlist::from_row)?.collect()
}

pub fn get_all_with_first_track_id(
    conn: &Connection,
) -> rusqlite::Result<Vec<PlaylistWithFirstTrackId>> {
    let mut stmt = conn.prepare_cached(concat!(
        "SELECT ",
        playlist_columns!(),
        ", NULL AS rank, ",
        first_track_id!(),
        " ",
        playlist_from!(),
        " ORDER BY p.created_at ASC"
    ))?;
    stmt.query_map([], PlaylistWithFirstTrackId::from_row)?
        .collect()
}

pub fn get_page_rows(
    conn: &Connection,
    search: Option<&SearchQuery>,
    after: Option<PlaylistCursor>,
    limit: u32,
) -> rusqlite::Result<Vec<PlaylistRow>> {
    match search.and_then(SearchQuery::fts) {
        Some(query) => get_search_page(conn, query, after, limit),
        None => get_browse_page(conn, after, limit),
    }
}

fn get_browse_page(
    conn: &Connection,
    after: Option<PlaylistCursor>,
    limit: u32,
) -> rusqlite::Result<Vec<PlaylistRow>> {
    let mut stmt = conn.prepare_cached(concat!(
        "SELECT ",
        playlist_columns!(),
        ", NULL AS rank ",
        "FROM playlists p ",
        cover_join!(),
        " ",
        "WHERE ?1 IS NULL OR (p.created_at, p.playlist_id) < (?1, ?2) ",
        "ORDER BY p.created_at DESC, p.playlist_id DESC ",
        "LIMIT ?3"
    ))?;

    let rows = stmt.query_map(
        params![
            after.map(|a| a.created_at),
            after.map(|a| a.playlist_id),
            limit
        ],
        PlaylistRow::from_row,
    )?;

    rows.collect()
}

fn get_search_page<Q: ToSql>(
    conn: &Connection,
    query: Q,
    after: Option<PlaylistCursor>,
    limit: u32,
) -> rusqlite::Result<Vec<PlaylistRow>> {
    let (rank, created_at, playlist_id) = match after {
        Some(PlaylistCursor {
            rank: Some(rank),
            created_at,
            playlist_id,
        }) => (Some(rank), Some(created_at), Some(playlist_id)),
        _ => (None, None, None),
    };

    let mut stmt = conn.prepare_cached(concat!(
        "SELECT ",
        playlist_columns!(),
        ", playlists_fts.rank AS rank ",
        "FROM playlists_fts ",
        "JOIN playlists p ON p.playlist_id = playlists_fts.rowid ",
        cover_join!(),
        " ",
        r#"
            WHERE playlists_fts MATCH ?1
                AND (
                    ?2 IS NULL
                    OR playlists_fts.rank > ?2
                    OR (
                        playlists_fts.rank = ?2
                        AND (
                            p.created_at < ?3
                            OR (p.created_at = ?3 AND p.playlist_id < ?4)
                        )
                    )
                )
            ORDER BY playlists_fts.rank ASC, p.created_at DESC, p.playlist_id DESC
            LIMIT ?5
        "#
    ))?;

    let rows = stmt.query_map(
        params![query, rank, created_at, playlist_id, limit],
        PlaylistRow::from_row,
    )?;

    rows.collect()
}

pub fn get_page_with_top_track_ids(
    conn: &Connection,
    search: Option<&SearchQuery>,
    after: Option<PlaylistCursor>,
    limit: u32,
) -> rusqlite::Result<Vec<PlaylistWithFirstTrackIds>> {
    let rows = get_page_rows(conn, search, after, limit)?;
    if rows.is_empty() {
        return Ok(Vec::new());
    }

    let playlist_ids: Vec<i64> = rows.iter().map(|r| r.playlist.playlist_id).collect();

    let mut tracks_map =
        get_top_track_ids_by_playlist_ids(conn, &playlist_ids, (PREVIEW_TRACKS_LIMIT + 1) as u32)?;

    let result = rows
        .into_iter()
        .map(|row| {
            let mut track_ids = tracks_map
                .remove(&row.playlist.playlist_id)
                .unwrap_or_default();

            let has_more = track_ids.len() > PREVIEW_TRACKS_LIMIT;
            track_ids.truncate(PREVIEW_TRACKS_LIMIT);

            PlaylistWithFirstTrackIds {
                playlist: row.playlist,
                track_ids,
                has_more,
                rank: row.rank,
            }
        })
        .collect();

    Ok(result)
}

pub fn create(conn: &Connection, new: &NewPlaylist) -> rusqlite::Result<Playlist> {
    conn.prepare_cached(
        r#"
            INSERT INTO playlists (title, description)
            VALUES (?1, ?2)
            RETURNING playlist_id, title, description, created_at, NULL as cover_path
        "#,
    )?
    .query_row(params![new.title, new.description], Playlist::from_row)
}

pub fn update(
    conn: &Connection,
    playlist_id: i64,
    update: &UpdatePlaylist,
) -> rusqlite::Result<bool> {
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
        return Ok(false);
    }

    let sql = format!(
        "UPDATE playlists SET {} WHERE playlist_id = ?",
        set_parts.join(", ")
    );

    values.push(Value::Integer(playlist_id));

    let mut stmt = conn.prepare(&sql)?;

    Ok(stmt.execute(params_from_iter(values))? > 0)
}

pub fn delete(conn: &Connection, playlist_id: i64) -> rusqlite::Result<bool> {
    let changed = conn
        .prepare_cached("DELETE FROM playlists WHERE playlist_id = ?1")?
        .execute(params![playlist_id])?;

    Ok(changed > 0)
}

pub fn get_cover_file(
    conn: &Connection,
    playlist_id: i64,
) -> rusqlite::Result<Option<(i64, String)>> {
    conn.prepare_cached(
        r#"
            SELECT vfr.file_id, vfr.full_path
            FROM playlists p
            JOIN v_files_resolved vfr ON vfr.file_id = p.cover_file_id
            WHERE p.playlist_id = ?1
        "#,
    )?
    .query_row(params![playlist_id], |r| Ok((r.get(0)?, r.get(1)?)))
    .optional()
}

pub fn set_cover_file_id(
    conn: &Connection,
    playlist_id: i64,
    file_id: Option<i64>,
) -> rusqlite::Result<()> {
    conn.prepare_cached("UPDATE playlists SET cover_file_id = ?2 WHERE playlist_id = ?1")?
        .execute(params![playlist_id, file_id])?;
    Ok(())
}
