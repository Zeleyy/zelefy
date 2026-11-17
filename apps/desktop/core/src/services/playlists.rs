use rusqlite::Connection;

use crate::{
    db::repository,
    models::playlists::{NewPlaylistRequest, NewPlaylistTrack, PlaylistWithFirstTrackId},
    services::errors::CoreError,
};

pub fn create_playlist(
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
