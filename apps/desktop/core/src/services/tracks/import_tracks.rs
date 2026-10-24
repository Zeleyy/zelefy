use std::{
    fs::{self, File},
    io::BufReader,
    path::Path,
};

use audio_core::{
    decoder::{WaveformOptions, decode_waveform},
    metadata::{AudioMetadata, read_metadata},
    processor::to_bin_bytes,
};
use rusqlite::Connection;
use serde::Serialize;
use uuid::Uuid;

use crate::{
    db::{DbState, repository},
    models::{
        libraries::Library,
        local_files::NewLocalFile,
        tracks::{LocalTrack, NewLocalTrack},
    },
    services::{errors::CoreError, utils::slugify},
    storage::dirs::{audio_rel_path, to_db_path, waveform_rel_path},
};

const AUDIO_EXTENSIONS: &[&str] = &["mp3", "flac", "wav", "ogg", "opus", "m4a", "aac"];

#[derive(Serialize)]
#[serde(tag = "status", rename_all = "camelCase")]
pub enum ImportOutcome {
    Imported { path: String, track: LocalTrack },
    Failed { path: String, error: String },
}

pub fn import_tracks(
    db: &DbState,
    paths: Vec<String>,
    library_id: Option<i64>,
    progress: impl Fn(usize, usize),
) -> Result<Vec<ImportOutcome>, CoreError> {
    let library = {
        let conn = lock(db);
        resolve_library(&conn, library_id)?
    };

    let total = paths.len();
    let mut out = Vec::with_capacity(total);
    for (i, path) in paths.into_iter().enumerate() {
        out.push(match import_one(db, &library, &path) {
            Ok(track) => ImportOutcome::Imported { path, track },
            Err(e) => ImportOutcome::Failed {
                path,
                error: e.to_string(),
            },
        });
        progress(i + 1, total);
    }
    Ok(out)
}

struct TrackInfo {
    title: String,
    duration_seconds: Option<i64>,
    genre: Option<String>,
    artist: Option<String>,
    waveform_path: Option<String>,
}

fn import_one(db: &DbState, library: &Library, path: &str) -> Result<LocalTrack, CoreError> {
    let src = Path::new(path);
    let file = std::fs::File::open(src)?;
    let track_id = Uuid::new_v4();

    let ext = audio_extension(src)?;
    let meta = read_file_metadata(src);
    let waveform = decode_waveform(file, WaveformOptions::default())
        .map_err(CoreError::AudioProcessingError)?;
    let waveform_bytes = to_bin_bytes(&waveform.peaks);

    let waveform_rel = waveform_rel_path(track_id, "bin");
    let waveform_dest = Path::new(&library.path).join(&waveform_rel);

    create_file_with_data(&waveform_dest, &waveform_bytes)?;

    let info = TrackInfo {
        title: meta
            .title
            .filter(|t| !t.trim().is_empty())
            .unwrap_or_else(|| file_title(src)),
        duration_seconds: meta.duration_secs.map(|d| d.round() as i64),
        genre: meta.genre,
        artist: meta.artist,
        waveform_path: Some(to_db_path(&waveform_rel)),
    };

    let audio_rel = audio_rel_path(track_id, &ext);
    let audio_dest = Path::new(&library.path).join(&audio_rel);

    let size = copy_file(src, &audio_dest)?;

    match register(db, library.library_id, to_db_path(&audio_rel), size, info) {
        Ok(track) => Ok(track),
        Err(e) => {
            let _ = fs::remove_file(&audio_dest);
            let _ = fs::remove_file(&waveform_dest);
            Err(e)
        }
    }
}

fn audio_extension(src: &Path) -> Result<String, CoreError> {
    if !src.is_file() {
        return Err(CoreError::Validation(format!(
            "not a file: {}",
            src.display()
        )));
    }

    let ext = src
        .extension()
        .and_then(|e| e.to_str())
        .map(str::to_lowercase);

    match ext {
        Some(e) if AUDIO_EXTENSIONS.contains(&e.as_str()) => Ok(e),
        _ => Err(CoreError::Validation(format!(
            "unsupported format: {}",
            src.display()
        ))),
    }
}

fn file_title(src: &Path) -> String {
    src.file_stem()
        .map(|s| s.to_string_lossy().into_owned())
        .unwrap_or_else(|| "Untitled".into())
}

fn copy_file(src: &Path, dest: &Path) -> Result<i64, CoreError> {
    if let Some(dir) = dest.parent() {
        fs::create_dir_all(dir)?;
    }
    let size = fs::copy(src, dest).inspect_err(|_| {
        let _ = fs::remove_file(dest);
    })?;
    Ok(size as i64)
}

fn create_file_with_data(src: &Path, data: &Vec<u8>) -> Result<(), CoreError> {
    if let Some(dir) = src.parent() {
        fs::create_dir_all(dir)?;
    }
    fs::write(src, data)?;
    Ok(())
}

fn register(
    db: &DbState,
    library_id: i64,
    file_path: String,
    size: i64,
    info: TrackInfo,
) -> Result<LocalTrack, CoreError> {
    let file = NewLocalFile {
        library_id: Some(library_id),
        file_path,
        is_link: false,
        file_hash: None,
        file_size_bytes: size,
    };

    let mut conn = lock(db);
    let tx = conn.transaction()?;

    let file_id = repository::local_files::create(&tx, &file)?;
    let track_id = repository::tracks::create_local(
        &tx,
        &NewLocalTrack {
            file_id,
            permalink: slugify(&info.title),
            metadata_artist: info.artist,
            title: info.title,
            duration_seconds: info.duration_seconds,
            genre: info.genre,
            description: None,
            is_private: false,
            waveform_path: info.waveform_path,
        },
    )?;
    let track = repository::tracks::get_by_id(&tx, track_id)?;

    tx.commit()?;
    Ok(track)
}

fn resolve_library(conn: &Connection, library_id: Option<i64>) -> Result<Library, CoreError> {
    match library_id {
        Some(id) => repository::libraries::get_by_id(conn, id).map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => CoreError::NotFound(id),
            e => e.into(),
        }),
        None => repository::libraries::get_primary(conn)?
            .ok_or_else(|| CoreError::Validation("no primary library".into())),
    }
}

fn lock(db: &DbState) -> std::sync::MutexGuard<'_, Connection> {
    db.conn.lock().unwrap_or_else(|e| e.into_inner())
}

fn read_file_metadata(path: &Path) -> AudioMetadata {
    File::open(path)
        .ok()
        .and_then(|f| read_metadata(&mut BufReader::new(f)).ok())
        .unwrap_or_default()
}
