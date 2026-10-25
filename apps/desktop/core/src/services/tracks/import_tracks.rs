use std::{
    fs::{self, File},
    io::BufReader,
    path::{Path, PathBuf},
};

use audio_core::{
    decoder::{WaveformOptions, decode_waveform},
    metadata::{AudioMetadata, cover_ext, read_metadata},
    processor::to_bin_bytes,
};
use rusqlite::Connection;
use serde::Serialize;
use uuid::Uuid;

use crate::{
    db::{DbState, repository},
    models::{
        libraries::Library,
        tracks::{LocalTrackResponse, NewTrack, NewTrackFile, TrackFileType},
    },
    services::{errors::CoreError, tracks::load_track},
    storage::dirs::{audio_rel_path, image_rel_path, to_db_path, waveform_rel_path},
};

const AUDIO_EXTENSIONS: &[&str] = &["mp3", "flac", "wav", "ogg", "opus", "m4a", "aac"];

#[derive(Serialize)]
#[serde(tag = "status", rename_all = "camelCase")]
pub enum ImportOutcome {
    Imported {
        path: String,
        track: LocalTrackResponse,
    },
    Failed {
        path: String,
        error: String,
    },
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

struct StoredFile {
    kind: TrackFileType,
    path: String,
    size: i64,
}

struct TrackInfo {
    title: String,
    duration_seconds: i64,
    genre: Option<String>,
    artist: Option<String>,
    files: Vec<StoredFile>,
}

fn import_one(
    db: &DbState,
    library: &Library,
    path: &str,
) -> Result<LocalTrackResponse, CoreError> {
    let src = Path::new(path);
    let ext = audio_extension(src)?;
    let id = Uuid::new_v4();
    let root = Path::new(&library.path);
    let meta = read_file_metadata(src);
    let mut written = Written::default();
    let mut files = Vec::new();

    let audio_rel = audio_rel_path(id, &ext);
    let audio_dest = root.join(&audio_rel);
    written.track(audio_dest.clone());
    let size = copy_file(src, &audio_dest)?;
    files.push(StoredFile {
        kind: TrackFileType::Audio,
        path: to_db_path(&audio_rel),
        size,
    });

    if let Some(bytes) = make_waveform(src) {
        let rel = waveform_rel_path(id, "bin");
        files.push(save_asset(
            root,
            &mut written,
            TrackFileType::Waveform,
            rel,
            &bytes,
        )?);
    }

    if let Some(c) = &meta.cover {
        let rel = image_rel_path(id, cover_ext(c));
        files.push(save_asset(
            root,
            &mut written,
            TrackFileType::Cover,
            rel,
            &c.data,
        )?);
    }

    let info = TrackInfo {
        title: meta
            .title
            .filter(|t| !t.trim().is_empty())
            .unwrap_or_else(|| file_title(src)),
        duration_seconds: meta.duration_secs.round() as i64,
        genre: meta.genre,
        artist: meta.artist,
        files,
    };

    let track = register(db, library.library_id, info)?;
    written.keep();
    Ok(track)
}

fn save_asset(
    root: &Path,
    written: &mut Written,
    kind: TrackFileType,
    rel: PathBuf,
    data: &[u8],
) -> Result<StoredFile, CoreError> {
    let dest = root.join(&rel);
    written.track(dest.clone());
    create_file_with_data(&dest, data)?;
    Ok(StoredFile {
        kind,
        path: to_db_path(&rel),
        size: data.len() as i64,
    })
}

fn register(
    db: &DbState,
    library_id: i64,
    info: TrackInfo,
) -> Result<LocalTrackResponse, CoreError> {
    let mut conn = lock(db);
    let tx = conn.transaction()?;

    let track_id = repository::tracks::tracks::create(
        &tx,
        &NewTrack {
            title: info.title,
            metadata_artist: info.artist,
            duration_seconds: info.duration_seconds,
            genre: info.genre,
            ..Default::default()
        },
    )?;

    for f in info.files {
        repository::tracks::track_files::create(
            &tx,
            &NewTrackFile {
                track_id,
                track_file_type: f.kind,
                library_id: Some(library_id),
                path: f.path,
                is_link: false,
                size_bytes: f.size,
                hash: None,
            },
        )?;
    }

    let response = load_track(&tx, track_id)?;
    tx.commit()?;
    Ok(response)
}

#[derive(Default)]
struct Written(Vec<PathBuf>);

impl Written {
    fn track(&mut self, p: PathBuf) {
        self.0.push(p);
    }
    fn keep(mut self) {
        self.0.clear();
    }
}

impl Drop for Written {
    fn drop(&mut self) {
        for p in &self.0 {
            let _ = fs::remove_file(p);
        }
    }
}

fn make_waveform(src: &Path) -> Option<Vec<u8>> {
    let file = File::open(src).ok()?;
    let wave = decode_waveform(file, WaveformOptions::default()).ok()?;
    Some(to_bin_bytes(&wave.peaks))
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

fn create_file_with_data(src: &Path, data: &[u8]) -> Result<(), CoreError> {
    if let Some(dir) = src.parent() {
        fs::create_dir_all(dir)?;
    }
    fs::write(src, data)?;
    Ok(())
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
