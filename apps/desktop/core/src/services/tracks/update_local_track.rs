use std::{
    fs,
    path::{Path, PathBuf},
};
use uuid::Uuid;

use crate::{
    constants::IMAGE_EXTENSIONS,
    db::{DbState, repository},
    models::{
        files::{FileType, NewFile, UpdateFile},
        libraries::Library,
        tracks::{LocalTrackResponse, NewTrackFile, TrackFilesWithPath, UpdateTrackRequest},
    },
    services::{errors::CoreError, tracks::load_track},
    storage::dirs::{image_rel_path, to_db_path},
    utils::files::{Written, copy_file},
};

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
            let mut conn = db.lock();
            let tx = conn.transaction()?;
            let files = repository::tracks::track_files::get_by_track_id_with_paths(&tx, track_id)?;
            let library_id = files
                .image
                .as_ref()
                .and_then(|c| c.library_id)
                .or_else(|| files.audio.as_ref().and_then(|a| a.library_id))
                .ok_or_else(|| {
                    CoreError::Validation("cannot determine library for cover".into())
                })?;
            let library = repository::libraries::get_by_id(&tx, library_id)?
                .ok_or_else(|| CoreError::Validation("library not found".into()))?;
            staged = Some(stage_cover(&files, &library, Path::new(p))?);
        }
        Some(None) => {
            let conn = db.lock();
            let files =
                repository::tracks::track_files::get_by_track_id_with_paths(&conn, track_id)?;
            if let Some(image) = files.image {
                cover_to_delete = Some((image.track_file.file_id, PathBuf::from(image.full_path)));
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
                    repository::files::update(
                        &tx,
                        *file_id,
                        &UpdateFile {
                            path: Some(to_db_path(&s.rel)),
                            size_bytes: Some(s.size),
                            ..Default::default()
                        },
                    )?;
                }
                None => {
                    let file_id = repository::files::create(
                        &tx,
                        &NewFile {
                            file_type: FileType::Image,
                            library_id: Some(s.library_id),
                            path: to_db_path(&s.rel),
                            is_link: false,
                            size_bytes: s.size,
                            hash: None,
                        },
                    )?;

                    repository::tracks::track_files::create(
                        &tx,
                        &NewTrackFile {
                            track_id,
                            file_id,
                            file_type: FileType::Image,
                        },
                    )?;
                }
            }
        }

        if let Some((file_id, _)) = &cover_to_delete {
            repository::files::delete(&tx, *file_id)?; // track_file удаляется за счёт CASCADE
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

fn stage_cover(
    files: &TrackFilesWithPath,
    library: &Library,
    src: &Path,
) -> Result<StagedCover, CoreError> {
    let ext = src
        .extension()
        .and_then(|e| e.to_str())
        .map(str::to_lowercase)
        .filter(|e| IMAGE_EXTENSIONS.contains(&e.as_str()))
        .ok_or_else(|| CoreError::Validation(format!("unsupported image: {}", src.display())))?;

    let rel = image_rel_path(Uuid::new_v4(), &ext);
    let abs = Path::new(&library.path).join(&rel);
    let size = copy_file(src, &abs)?;

    Ok(StagedCover {
        abs,
        rel,
        size,
        library_id: library.library_id,
        old: files
            .image
            .as_ref()
            .map(|c| (c.track_file.file_id, PathBuf::from(&c.full_path))),
    })
}
