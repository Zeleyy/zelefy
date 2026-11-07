use audio_core::{
    decoder::{WaveformOptions, decode_waveform},
    processor::to_bin_bytes,
};
use std::{fs::File, path::Path};

use crate::{
    db::{DbState, repository},
    jobs::JobError,
    models::tracks::{NewTrackFile, TrackFileType},
    storage::dirs::{to_db_path, waveform_rel_path},
    utils::files::{Written, create_file_with_data},
};

pub fn run(db: &DbState, track_id: i64) -> Result<(), JobError> {
    let (local_uuid, audio_path, lib) = {
        let conn = db.lock();

        let Some(resp) = repository::tracks::tracks::get_local_by_id_with_files(&conn, track_id)?
        else {
            return Err(JobError::TrackGone);
        };

        let files = &resp.track_files;
        if files.waveform.is_some() {
            return Ok(());
        }

        let audio = files
            .audio
            .as_ref()
            .ok_or_else(|| JobError::Failed("track has no audio file".into()))?;

        let lib = match &audio.library {
            Some(l) => l.clone(),
            None => repository::libraries::get_primary(&conn)?
                .ok_or_else(|| JobError::Failed("no primary library".into()))?,
        };

        (
            resp.track.local_uuid,
            Path::new(&lib.path).join(&audio.track_file.path),
            lib,
        )
    };

    let file = File::open(audio_path)?;
    let wave = decode_waveform(file, WaveformOptions::default())
        .map_err(|e| JobError::Failed(e.to_string()))?;
    let bytes = to_bin_bytes(&wave.peaks);

    let rel = waveform_rel_path(local_uuid, "bin");
    let dest = Path::new(&lib.path).join(&rel);
    let mut written = Written::default();
    written.file(dest.clone());
    create_file_with_data(&dest, &bytes)?;

    {
        let conn = db.lock();
        repository::tracks::track_files::create(
            &conn,
            &NewTrackFile {
                track_id,
                track_file_type: TrackFileType::Waveform,
                library_id: Some(lib.library_id),
                path: to_db_path(&rel),
                is_link: false,
                size_bytes: bytes.len() as i64,
                hash: None,
            },
        )?;
    }
    written.keep();
    Ok(())
}
