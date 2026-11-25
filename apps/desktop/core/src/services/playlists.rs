use std::{
    fs,
    path::{Path, PathBuf},
};

use rusqlite::Connection;
use uuid::Uuid;

use crate::{
    constants::IMAGE_EXTENSIONS,
    db::repository,
    models::{
        files::{FileType, NewFile},
        libraries::Library,
        playlists::{
            MoveTrackRequest, NewPlaylistRequest, NewPlaylistTrack, PlaylistWithFirstTrackId,
            UpdatePlaylist, UpdatePlaylistRequest,
        },
    },
    services::errors::CoreError,
    storage::dirs::{image_rel_path, to_db_path},
    utils::files::{Written, copy_file},
};

pub fn create_local_playlist(
    conn: &mut Connection,
    new: NewPlaylistRequest,
) -> Result<PlaylistWithFirstTrackId, CoreError> {
    let tx = conn.transaction()?;

    let playlist = repository::playlists::create(&tx, &new.playlist)?;

    repository::playlists::playlist_tracks::add(
        &tx,
        &NewPlaylistTrack {
            playlist_id: playlist.playlist_id,
            track_id: new.track_id,
            position: 0.0,
        },
    )?;

    tx.commit()?;

    Ok(PlaylistWithFirstTrackId {
        playlist: playlist,
        track_id: Some(new.track_id),
        rank: None,
    })
}

pub fn replace_local_track(
    conn: &mut Connection,
    playlist_id: i64,
    request: MoveTrackRequest,
) -> Result<(), CoreError> {
    let tx = conn.transaction()?;

    let moved_pos =
        repository::playlists::playlist_tracks::get_position(&tx, playlist_id, request.track_id)?;

    if moved_pos.is_none() {
        return Err(CoreError::NotFound(request.track_id));
    };

    let (after_id, before_id) = match (request.after_track_id, request.before_track_id) {
        (None, None) => {
            return Err(CoreError::Validation(
                "after_track_id or before_track_id is required".into(),
            ));
        }
        (a, b) => (a, b),
    };

    if after_id == Some(request.track_id) || before_id == Some(request.track_id) {
        return Err(CoreError::Validation(
            "neighbor track cannot be the moved track".into(),
        ));
    }
    if after_id.is_some() && after_id == before_id {
        return Err(CoreError::Validation(
            "after_track_id and before_track_id must differ".into(),
        ));
    }

    let prev_pos = match after_id {
        Some(id) => Some(
            repository::playlists::playlist_tracks::get_position(&tx, playlist_id, id)?
                .ok_or(CoreError::NotFound(id))?,
        ),
        None => None,
    };
    let next_pos = match before_id {
        Some(id) => Some(
            repository::playlists::playlist_tracks::get_position(&tx, playlist_id, id)?
                .ok_or(CoreError::NotFound(id))?,
        ),
        None => None,
    };

    let new_position = match (prev_pos, next_pos) {
        (Some(p), Some(n)) => {
            if p == n {
                return Err(CoreError::Validation(
                    "positions exhausted between neighbors, rebalance required".into(),
                ));
            }
            (p + n) / 2.0
        }
        (Some(p), None) => p + 1000.0,
        (None, Some(n)) => n - 1000.0,
        (None, None) => unreachable!("guarded above"),
    };

    if !new_position.is_finite() {
        return Err(CoreError::Validation("position must be finite".into()));
    }

    repository::playlists::playlist_tracks::update_position(
        &tx,
        playlist_id,
        request.track_id,
        new_position,
    )?;

    tx.commit()?;
    Ok(())
}

pub fn update_local_playlist(
    conn: &mut Connection,
    playlist_id: i64,
    library_id: Option<i64>,
    req: UpdatePlaylistRequest,
) -> Result<i64, CoreError> {
    if req.is_empty() {
        return Ok(playlist_id);
    }

    let tx = conn.transaction()?;

    let library = match library_id {
        Some(id) => {
            repository::libraries::get_by_id(&tx, id)?.ok_or_else(|| CoreError::NotFound(id))?
        }
        None => repository::libraries::get_primary(&tx)?
            .ok_or_else(|| CoreError::Validation("primary library not found".to_string()))?,
    };

    let mut written = Written::default();
    let new_cover = match &req.new_cover_path {
        Some(Some(src)) => {
            let cover = copy_cover(&library, Path::new(src))?;
            written.file(cover.abs.clone());
            Some(cover)
        }
        _ => None,
    };

    if !repository::playlists::update(
        &tx,
        playlist_id,
        &UpdatePlaylist {
            title: req.title,
            description: req.description,
        },
    )? {
        return Err(CoreError::NotFound(playlist_id));
    }

    let mut old_cover = None;
    if req.new_cover_path.is_some() {
        old_cover = repository::playlists::get_cover_file(&tx, playlist_id)?;

        let new_file_id = match &new_cover {
            Some(c) => Some(repository::files::create(
                &tx,
                &NewFile {
                    file_type: FileType::Image,
                    library_id: Some(library.library_id),
                    path: to_db_path(&c.rel),
                    is_link: false,
                    size_bytes: c.size,
                    hash: None,
                },
            )?),
            None => None,
        };

        repository::playlists::set_cover_file_id(&tx, playlist_id, new_file_id)?;

        if let Some((old_id, _)) = &old_cover {
            repository::files::delete(&tx, *old_id)?;
        }
    }

    tx.commit()?;

    written.keep();
    if let Some((_, path)) = old_cover {
        let _ = fs::remove_file(path);
    }

    Ok(playlist_id)
}

struct CopiedCover {
    abs: PathBuf,
    rel: PathBuf,
    size: i64,
}

fn copy_cover(library: &Library, src: &Path) -> Result<CopiedCover, CoreError> {
    let ext = src
        .extension()
        .and_then(|e| e.to_str())
        .map(str::to_lowercase)
        .filter(|e| IMAGE_EXTENSIONS.contains(&e.as_str()))
        .ok_or_else(|| CoreError::Validation(format!("unsupported image: {}", src.display())))?;

    let rel = image_rel_path(Uuid::new_v4(), &ext);
    let abs = Path::new(&library.path).join(&rel);
    let size = copy_file(src, &abs)?;

    Ok(CopiedCover { abs, rel, size })
}
