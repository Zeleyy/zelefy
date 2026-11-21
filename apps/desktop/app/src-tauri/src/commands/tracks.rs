use desktop_core::{
    db::{repository, DbState},
    models::{
        tracks::{
            LocalTrackCursor, LocalTrackIdResponse, LocalTrackIdsPage, LocalTrackResponse,
            LocalTracksPage, UpdateTrackRequest,
        },
        utils::SearchQuery,
    },
    services::{self, tracks::ImportOutcome},
};
use tauri::{ipc::Channel, AppHandle, Manager, State};

use crate::jobs::JobsHandle;

#[tauri::command]
pub async fn import_tracks(
    app: AppHandle,
    paths: Vec<String>,
    library_id: Option<i64>,
    on_progress: Channel<(usize, usize)>,
) -> Result<Vec<ImportOutcome>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let db = app.state::<DbState>();
        let jobs = app.state::<JobsHandle>();
        let res = services::tracks::import_tracks(&db, paths, library_id, |done, total| {
            jobs.wake();
            let _ = on_progress.send((done, total));
        });
        jobs.wake();
        res
    })
    .await
    .map_err(|e| e.to_string())?
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_local_tracks(db: State<'_, DbState>) -> Result<Vec<LocalTrackResponse>, String> {
    let conn = db.lock();
    repository::tracks::tracks::get_all_local_with_files(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_local_track_ids_paged(
    db: State<'_, DbState>,
    search: Option<SearchQuery>,
    after: Option<LocalTrackCursor>,
    limit: Option<u32>,
) -> Result<LocalTrackIdsPage, String> {
    let (limit, fetch) = LocalTrackIdsPage::resolve_limits(limit, 50, 200);

    let conn = db.lock();

    let track_ids =
        repository::tracks::tracks::get_local_ids_page(&conn, search.as_ref(), after, fetch)
            .map_err(|e| e.to_string())?;

    Ok(LocalTrackIdsPage::from_fetched(track_ids, limit, |id| {
        LocalTrackCursor { track_id: *id }
    }))
}

#[tauri::command]
pub fn get_local_tracks_paged(
    db: State<'_, DbState>,
    search: Option<SearchQuery>,
    after: Option<LocalTrackCursor>,
    limit: Option<u32>,
) -> Result<LocalTracksPage, String> {
    let (limit, fetch) = LocalTracksPage::resolve_limits(limit, 50, 200);

    let mut conn = db.lock();

    let tracks = services::tracks::get_local_tracks_paged(&mut conn, search.as_ref(), after, fetch)
        .map_err(|e| e.to_string())?;

    Ok(LocalTracksPage::from_fetched(tracks, limit, |t| {
        LocalTrackCursor {
            track_id: t.track_id,
        }
    }))
}

#[tauri::command]
pub fn get_local_tracks_ids(db: State<'_, DbState>) -> Result<Vec<LocalTrackIdResponse>, String> {
    let mut conn = db.lock();
    repository::tracks::tracks::get_local_ids_with_files(&mut conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_local_track(
    db: State<'_, DbState>,
    track_id: i64,
) -> Result<LocalTrackResponse, String> {
    let conn = db.lock();
    services::tracks::load_track(&conn, track_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_local_tracks_by_ids(
    db: State<'_, DbState>,
    track_ids: Vec<i64>,
) -> Result<Vec<LocalTrackResponse>, String> {
    let conn = db.lock();
    repository::tracks::tracks::get_local_by_ids_with_files(&conn, track_ids)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_local_track(
    db: State<'_, DbState>,
    track_id: i64,
    update: UpdateTrackRequest,
) -> Result<LocalTrackResponse, String> {
    services::tracks::update_local_track(&db, track_id, update).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_local_track(db: State<'_, DbState>, track_id: i64) -> Result<i64, String> {
    services::tracks::delete_local_track(&db, track_id).map_err(|e| e.to_string())
}
