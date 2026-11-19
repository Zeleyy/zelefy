use desktop_core::{
    db::{repository, DbState},
    models::playlists::{
        MoveTrackRequest, NewPlaylistRequest, Playlist, PlaylistTrackCursor, PlaylistTracksPage,
        PlaylistWithFirstTrackId, UpdatePlaylist,
    },
    services,
};
use tauri::State;

#[tauri::command]
pub fn get_local_playlist(
    db: State<'_, DbState>,
    playlist_id: i64,
) -> Result<Option<Playlist>, String> {
    let conn = db.lock();
    repository::playlists::get_by_id(&conn, playlist_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_local_playlists_with_first_track(
    db: State<'_, DbState>,
) -> Result<Vec<PlaylistWithFirstTrackId>, String> {
    let conn = db.lock();
    repository::playlists::get_all_with_first_track_id(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_local_playlist_tracks_paged(
    db: State<'_, DbState>,
    playlist_id: i64,
    after: Option<PlaylistTrackCursor>,
    limit: Option<u32>,
) -> Result<PlaylistTracksPage, String> {
    let limit = limit.unwrap_or(50).clamp(1, 200);
    let fetch = limit.saturating_add(1);

    let conn = db.lock();

    let mut tracks =
        repository::playlists::playlist_tracks::get_page(&conn, playlist_id, after, fetch)
            .map_err(|e| e.to_string())?;

    let has_more = tracks.len() > limit as usize;
    tracks.truncate(limit as usize);

    let next_cursor = if has_more {
        tracks.last().map(|t| PlaylistTrackCursor {
            position: t.position,
        })
    } else {
        None
    };

    Ok(PlaylistTracksPage {
        items: tracks,
        next_cursor,
    })
}

#[tauri::command]
pub fn get_local_playlist_track_ids(
    db: State<'_, DbState>,
    playlist_id: i64,
) -> Result<Vec<i64>, String> {
    let conn = db.lock();
    repository::playlists::playlist_tracks::get_all_track_ids(&conn, playlist_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_local_playlist(
    db: State<'_, DbState>,
    new: NewPlaylistRequest,
) -> Result<PlaylistWithFirstTrackId, String> {
    let mut conn = db.lock();
    services::playlists::create_local_playlist(&mut conn, new).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_local_playlist(
    db: State<'_, DbState>,
    playlist_id: i64,
    update: UpdatePlaylist,
) -> Result<i64, String> {
    let conn = db.lock();
    repository::playlists::update(&conn, playlist_id, &update).map_err(|e| e.to_string())?;
    Ok(playlist_id)
}

#[tauri::command]
pub fn delete_local_playlist(
    db: State<'_, DbState>,
    playlist_id: i64,
) -> Result<Option<i64>, String> {
    let conn = db.lock();
    let deleted = repository::playlists::delete(&conn, playlist_id).map_err(|e| e.to_string())?;
    if deleted {
        Ok(Some(playlist_id))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn add_local_playlist_track_end(
    db: State<'_, DbState>,
    playlist_id: i64,
    track_id: i64,
) -> Result<i64, String> {
    let conn = db.lock();
    repository::playlists::playlist_tracks::add_to_end(&conn, playlist_id, track_id)
        .map_err(|e| e.to_string())?;
    Ok(playlist_id)
}

#[tauri::command]
pub fn remove_local_playlist_track(
    db: State<'_, DbState>,
    playlist_id: i64,
    track_id: i64,
) -> Result<Option<i64>, String> {
    let conn = db.lock();
    let deleted = repository::playlists::playlist_tracks::remove(&conn, playlist_id, track_id)
        .map_err(|e| e.to_string())?;
    if deleted {
        Ok(Some(playlist_id))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn replace_local_playlist_track(
    db: State<'_, DbState>,
    playlist_id: i64,
    request: MoveTrackRequest,
) -> Result<(), String> {
    let mut conn = db.lock();
    services::playlists::replace_local_track(&mut conn, playlist_id, request)
        .map_err(|e| e.to_string())
}
