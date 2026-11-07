use std::{
    fs,
    path::{Path, PathBuf},
};
use uuid::Uuid;

use crate::{
    db::{DbState, repository},
    models::tracks::{
        LocalTrackResponse, NewTrackFile, TrackFileType, UpdateTrackFile, UpdateTrackRequest,
    },
    services::{errors::CoreError, tracks::load_track},
    storage::dirs::{image_rel_path, to_db_path},
    utils::files::{Written, copy_file},
};

const IMAGE_EXTENSIONS: &[&str] = &["jpg", "jpeg", "png", "webp"];

struct StagedCover {
    abs: PathBuf,
    rel: PathBuf,
    size: i64,
    library_id: i64,
    old: Option<(i64, PathBuf)>,
}

pub fn update_local_track(
    db: &DbState,
    track_id: i64,
    update: UpdateTrackRequest,
) -> Result<LocalTrackResponse, CoreError> {
    if update.update_track.is_empty() && update.new_cover_path.is_none() {
        let conn = db.lock();
        return load_track(&conn, track_id);
    }

    let staged = match update.new_cover_path {
        Some(p) => {
            let track = {
                let conn = db.lock();
                repository::tracks::tracks::get_local_by_id_with_files(&conn, track_id)?
                    .ok_or(CoreError::NotFound(track_id))?
            };
            Some(stage_cover(&track, Path::new(&p))?)
        }
        None => None,
    };

    let mut written = Written::default();
    if let Some(s) = &staged {
        written.file(s.abs.clone());
    }

    let response = {
        let mut conn = db.lock();
        let tx = conn.transaction()?;

        if !update.update_track.is_empty() {
            let rows = repository::tracks::tracks::update(&tx, track_id, &update.update_track)?;
            if rows == 0 {
                return Err(CoreError::NotFound(track_id));
            }
        }

        if let Some(s) = &staged {
            match &s.old {
                Some((file_id, _)) => {
                    repository::tracks::track_files::update(
                        &tx,
                        *file_id,
                        &UpdateTrackFile {
                            path: Some(to_db_path(&s.rel)),
                            size_bytes: Some(s.size),
                            ..Default::default()
                        },
                    )?;
                }
                None => {
                    repository::tracks::track_files::create(
                        &tx,
                        &NewTrackFile {
                            track_id,
                            track_file_type: TrackFileType::Cover,
                            library_id: Some(s.library_id),
                            path: to_db_path(&s.rel),
                            is_link: false,
                            size_bytes: s.size,
                            hash: None,
                        },
                    )?;
                }
            }
        }

        let response = load_track(&tx, track_id)?;
        tx.commit()?;
        response
    };

    written.keep();

    if let Some(StagedCover {
        old: Some((_, old_abs)),
        ..
    }) = staged
    {
        let _ = fs::remove_file(old_abs);
    }

    Ok(response)
}

fn stage_cover(track: &LocalTrackResponse, src: &Path) -> Result<StagedCover, CoreError> {
    let ext = src
        .extension()
        .and_then(|e| e.to_str())
        .map(str::to_lowercase)
        .filter(|e| IMAGE_EXTENSIONS.contains(&e.as_str()))
        .ok_or_else(|| CoreError::Validation(format!("unsupported image: {}", src.display())))?;

    let cover = track.track_files.cover.as_ref();
    let library = cover
        .and_then(|c| c.library.as_ref())
        .or_else(|| {
            track
                .track_files
                .audio
                .as_ref()
                .and_then(|a| a.library.as_ref())
        })
        .ok_or_else(|| CoreError::Validation("cannot determine library for cover".into()))?;

    let rel = image_rel_path(Uuid::new_v4(), &ext);
    let abs = Path::new(&library.path).join(&rel);
    let size = copy_file(src, &abs)?;

    Ok(StagedCover {
        abs,
        rel,
        size,
        library_id: library.library_id,
        old: cover.map(|c| {
            (
                c.track_file.file_id,
                Path::new(&library.path).join(&c.track_file.path),
            )
        }),
    })
}
