use rusqlite::Connection;

use crate::{
    db::repository,
    models::playlists::{
        MoveTrackRequest, NewPlaylistRequest, NewPlaylistTrack, PlaylistWithFirstTrackId,
    },
    services::errors::CoreError,
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
