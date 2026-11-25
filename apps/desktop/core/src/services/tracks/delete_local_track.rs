use std::{
    fs, io,
    path::{Path, PathBuf},
    time::Duration,
};

use crate::{
    db::{DbState, repository},
    models::tracks::TrackFilesWithPath,
    services::errors::CoreError,
};

pub fn delete_local_track(db: &DbState, track_id: i64) -> Result<i64, CoreError> {
    let (removed_id, files) = {
        let mut conn = db.lock();
        let tx = conn.transaction()?;

        let track = repository::tracks::track_files::get_by_track_id_with_paths(&tx, track_id)?;
        let files = owned_file_paths(&track);

        repository::files::delete_by_track_id(&tx, track_id)?;
        let removed_id = repository::tracks::tracks::delete(&tx, track_id)?;
        tx.commit()?;
        (removed_id, files)
    };

    for path in files {
        remove_file_retry(&path)
    }

    Ok(removed_id)
}

fn owned_file_paths(files: &TrackFilesWithPath) -> Vec<PathBuf> {
    [
        files.image.as_ref(),
        files.waveform.as_ref(),
        files.audio.as_ref(),
    ]
    .into_iter()
    .flatten()
    .map(|f| PathBuf::from(&f.full_path))
    .collect()
}

fn remove_file_retry(path: &Path) {
    for attempt in 0..5 {
        match fs::remove_file(path) {
            Ok(()) => return,
            Err(e) if e.kind() == io::ErrorKind::NotFound => return,
            Err(e) if attempt < 4 => {
                std::thread::sleep(Duration::from_millis(50));
                let _ = e;
            }
            Err(e) => eprintln!("failed to remove {}: {e}", path.display()),
        }
    }
}
