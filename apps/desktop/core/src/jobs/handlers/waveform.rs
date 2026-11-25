use audio_core::{
    decoder::{WaveformOptions, decode_waveform},
    processor::to_bin_bytes,
};
use std::{fs::File, path::Path};

use crate::{
    db::{DbState, repository},
    jobs::JobError,
    models::{
        files::{FileType, NewFile},
        tracks::NewTrackFile,
    },
    storage::dirs::{to_db_path, waveform_rel_path},
    utils::files::{Written, create_file_with_data},
};

pub fn run(db: &DbState, track_id: i64) -> Result<(), JobError> {
    let (local_uuid, audio_path, lib) = {
        let mut conn = db.lock();
        let tx = conn.transaction()?;

        let Some(track) = repository::tracks::tracks::get_by_id(&tx, track_id)? else {
            return Err(JobError::TrackGone);
        };

        let files = repository::tracks::track_files::get_by_track_id_with_paths(&tx, track_id)?;

        if files.waveform.is_some() {
            return Ok(());
        }

        let audio = files
            .audio
            .as_ref()
            .ok_or_else(|| JobError::Failed("track has no audio file".into()))?;

        let lib = match audio.library_id {
            Some(lib_id) => repository::libraries::get_by_id(&tx, lib_id)?
                .ok_or_else(|| JobError::Failed("no library".into()))?,
            None => repository::libraries::get_primary(&tx)?
                .ok_or_else(|| JobError::Failed("no primary library".into()))?,
        };

        (track.local_uuid, audio.full_path.clone(), lib)
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
        let mut conn = db.lock();
        let tx = conn.transaction()?;

        let file_id = repository::files::create(
            &tx,
            &NewFile {
                file_type: FileType::Waveform,
                library_id: Some(lib.library_id),
                path: to_db_path(&rel),
                is_link: false,
                size_bytes: bytes.len() as i64,
                hash: None,
            },
        )?;

        repository::tracks::track_files::create(
            &tx,
            &NewTrackFile {
                track_id,
                file_id,
                file_type: FileType::Waveform,
            },
        )?;

        tx.commit()?;
    }
    written.keep();
    Ok(())
}
