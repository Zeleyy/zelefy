use std::{
    fs, io,
    path::{Path, PathBuf},
    time::Duration,
};

use crate::{
    db::{DbState, repository},
    models::tracks::LocalTrackResponse,
    services::errors::CoreError,
};

pub fn delete_local_track(db: &DbState, track_id: i64) -> Result<i64, CoreError> {
    let (removed_id, files) = {
        let mut conn = db.lock();
        let tx = conn.transaction()?;

        let track = repository::tracks::tracks::get_local_by_id_with_files(&tx, track_id)?
            .ok_or(CoreError::NotFound(track_id))?;
        let files = owned_file_paths(&track);

        let removed_id = repository::tracks::tracks::delete(&tx, track_id)?;
        tx.commit()?;
        (removed_id, files)
    };

    for path in files {
        remove_file_retry(&path)
    }

    Ok(removed_id)
}

fn owned_file_paths(track: &LocalTrackResponse) -> Vec<PathBuf> {
    let f = &track.track_files;
    [f.cover.as_ref(), f.waveform.as_ref(), f.audio.as_ref()]
        .into_iter()
        .flatten()
        .filter(|f| !f.track_file.is_link)
        .filter_map(|f| {
            f.library
                .as_ref()
                .map(|l| Path::new(&l.path).join(&f.track_file.path))
        })
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
