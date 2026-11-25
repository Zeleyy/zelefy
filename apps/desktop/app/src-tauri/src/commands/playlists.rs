use desktop_core::{
    db::{repository, DbState},
    models::{
        playlists::{
            MoveTrackRequest, NewPlaylistRequest, Playlist, PlaylistCursor, PlaylistTrackCursor,
            PlaylistTracksPage, PlaylistWithFirstTrackId, PlaylistsPage, UpdatePlaylistRequest,
        },
        utils::SearchQuery,
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
pub fn get_local_playlists_paged(
    db: State<'_, DbState>,
    search: Option<SearchQuery>,
    after: Option<PlaylistCursor>,
    limit: Option<u32>,
) -> Result<PlaylistsPage, String> {
    let (limit, fetch) = PlaylistsPage::resolve_limits(limit, 50, 200);

    let conn = db.lock();

    let playlists =
        repository::playlists::get_page_with_top_track_ids(&conn, search.as_ref(), after, fetch)
            .map_err(|e| e.to_string())?;

    Ok(PlaylistsPage::from_fetched(playlists, limit, |p| {
        PlaylistCursor {
            playlist_id: p.playlist.playlist_id,
            created_at: p.playlist.created_at,
            rank: p.rank,
        }
    }))
}

#[tauri::command]
pub fn get_local_playlist_tracks_paged(
    db: State<'_, DbState>,
    playlist_id: i64,
    after: Option<PlaylistTrackCursor>,
    limit: Option<u32>,
) -> Result<PlaylistTracksPage, String> {
    let (limit, fetch) = PlaylistTracksPage::resolve_limits(limit, 50, 200);

    let conn = db.lock();

    let tracks = repository::playlists::playlist_tracks::get_page(&conn, playlist_id, after, fetch)
        .map_err(|e| e.to_string())?;

    Ok(PlaylistTracksPage::from_fetched(tracks, limit, |pt| {
        PlaylistTrackCursor {
            position: pt.position,
        }
    }))
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
    library_id: Option<i64>,
    update: UpdatePlaylistRequest,
) -> Result<i64, String> {
    let mut conn = db.lock();
    services::playlists::update_local_playlist(&mut conn, playlist_id, library_id, update)
        .map_err(|e| e.to_string())
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
