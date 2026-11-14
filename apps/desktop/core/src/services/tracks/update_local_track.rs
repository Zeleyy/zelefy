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
    let has_cover_op = update.new_cover_path.is_some();

    if update.update_track.is_empty() && !has_cover_op {
        let conn = db.lock();
        return load_track(&conn, track_id);
    }

    let mut staged: Option<StagedCover> = None;
    let mut cover_to_delete: Option<(i64, PathBuf)> = None;

    match &update.new_cover_path {
        None => {}
        Some(Some(p)) => {
            let track = {
                let conn = db.lock();
                repository::tracks::tracks::get_local_by_id_with_files(&conn, track_id)?
                    .ok_or(CoreError::NotFound(track_id))?
            };
            staged = Some(stage_cover(&track, Path::new(p))?);
        }
        Some(None) => {
            let track = {
                let conn = db.lock();
                repository::tracks::tracks::get_local_by_id_with_files(&conn, track_id)?
                    .ok_or(CoreError::NotFound(track_id))?
            };
            if let Some(c) = track.track_files.cover.as_ref() {
                let library_path =
                    c.library
                        .as_ref()
                        .map(|l| PathBuf::from(&l.path))
                        .or_else(|| {
                            track
                                .track_files
                                .audio
                                .as_ref()
                                .and_then(|a| a.library.as_ref())
                                .map(|l| PathBuf::from(&l.path))
                        });
                let abs = library_path
                    .map(|p| p.join(&c.track_file.path))
                    .unwrap_or_else(|| PathBuf::from(&c.track_file.path));
                cover_to_delete = Some((c.track_file.file_id, abs));
            }
        }
    }

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

        if let Some((file_id, _)) = &cover_to_delete {
            repository::tracks::track_files::delete(&tx, *file_id)?;
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

    if let Some((_, abs)) = cover_to_delete {
        let _ = fs::remove_file(abs);
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
