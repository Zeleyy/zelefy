use desktop_core::{
    db::DbState,
    models::tracks::{LocalTrackResponse, UpdateTrackRequest},
    services::{self, tracks::ImportOutcome},
};
use tauri::{AppHandle, Emitter, Manager, State};

#[tauri::command]
pub async fn import_tracks(
    app: AppHandle,
    paths: Vec<String>,
    library_id: Option<i64>,
) -> Result<Vec<ImportOutcome>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let db = app.state::<DbState>();
        services::tracks::import_tracks(&db, paths, library_id, |done, total| {
            let _ = app.emit("import-progress", (done, total));
        })
    })
    .await
    .map_err(|e| e.to_string())?
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_local_tracks(db: State<'_, DbState>) -> Result<Vec<LocalTrackResponse>, String> {
    let mut conn = db.lock();
    services::tracks::get_local_tracks(&mut conn).map_err(|e| e.to_string())
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
