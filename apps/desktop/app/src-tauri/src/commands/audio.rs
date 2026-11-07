use desktop_core::{
    audio::{devices::AudioSink, AudioState},
    db::DbState,
    services,
};
use std::path::PathBuf;
use tauri::State;

#[tauri::command]
pub async fn player_load_local(
    track_id: i64,
    autoplay: bool,
    audio: State<'_, AudioState>,
    db: State<'_, DbState>,
) -> Result<(), String> {
    let path = {
        let conn = db.conn.lock().map_err(|e| e.to_string())?;
        let response = services::tracks::load_track(&conn, track_id).map_err(|e| e.to_string())?;

        let file = response
            .track_files
            .audio
            .ok_or("no audio file for track")?;
        let library = file
            .library
            .as_ref()
            .ok_or("audio file library not found")?;

        PathBuf::from(&library.path).join(&file.track_file.path)
    };

    if !path.is_file() {
        return Err(format!("file not found: {}", path.display()));
    }

    audio.load(path, autoplay);
    Ok(())
}

#[tauri::command]
pub fn player_play(s: State<AudioState>) {
    s.play()
}
#[tauri::command]
pub fn player_pause(s: State<AudioState>) {
    s.pause()
}
#[tauri::command]
pub fn player_stop(s: State<AudioState>) {
    s.stop()
}
#[tauri::command]
pub fn player_seek(seconds: f64, s: State<AudioState>) {
    s.seek(seconds)
}
#[tauri::command]
pub fn player_set_volume(volume: f32, s: State<AudioState>) {
    s.set_volume(volume)
}
#[tauri::command]
pub fn player_unload(audio: State<'_, AudioState>) {
    audio.unload();
}

#[tauri::command]
pub async fn player_list_devices(s: State<'_, AudioState>) -> Result<Vec<AudioSink>, String> {
    s.list_output_devices().map_err(|e| e.to_string())
}
