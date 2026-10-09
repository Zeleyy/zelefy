CREATE TABLE storage_types (
    storage_type_id INTEGER PRIMARY KEY,
    storage_type TEXT NOT NULL UNIQUE
);

INSERT INTO
    storage_types (storage_type_id, storage_type)
VALUES
    (0, 'cache'),
    (1, 'library');

CREATE TABLE storages (
    storage_id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
    storage_type_id INTEGER NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT 0,
    max_size_bytes INTEGER,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (storage_type_id) REFERENCES storage_types (storage_type_id) ON DELETE RESTRICT
);

CREATE TABLE local_files (
    file_id INTEGER PRIMARY KEY AUTOINCREMENT,
    storage_id INTEGER,
    file_path TEXT NOT NULL UNIQUE,
    is_link BOOLEAN NOT NULL DEFAULT 0,
    file_hash TEXT,
    file_size_bytes INTEGER NOT NULL,
    last_accessed_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (storage_id) REFERENCES storages (storage_id) ON DELETE CASCADE
);

CREATE INDEX idx_local_files_hash ON local_files (file_hash);

CREATE INDEX idx_local_files_storage ON local_files (storage_id);

CREATE TABLE local_tracks (
    track_id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL UNIQUE,
    remote_track_id TEXT UNIQUE,
    title TEXT NOT NULL,
    artist_name TEXT,
    album_title TEXT,
    duration_seconds REAL,
    cover_path TEXT,
    waveform_path TEXT,
    is_favorite BOOLEAN DEFAULT 0,
    added_at INTEGER NOT NULL,
    FOREIGN KEY (file_id) REFERENCES local_files (file_id) ON DELETE CASCADE
);

CREATE TABLE profiles (
    user_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    permalink TEXT NOT NULL UNIQUE,
    avatar_path TEXT,
    banner_path TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT 0,
    is_me BOOLEAN DEFAULT 0,
    updated_at INTEGER NOT NULL,
    last_accessed_at INTEGER NOT NULL
);

CREATE INDEX idx_profiles_permalink ON profiles (permalink);

CREATE TABLE track_artists (
    track_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    PRIMARY KEY (track_id, user_id),
    FOREIGN KEY (track_id) REFERENCES local_tracks (track_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profiles (user_id) ON DELETE CASCADE
);

CREATE INDEX idx_track_artists_user ON track_artists (user_id);

CREATE TABLE local_track_likes (
    user_id TEXT NOT NULL,
    track_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, track_id),
    FOREIGN KEY (user_id) REFERENCES profiles (user_id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES local_tracks (track_id) ON DELETE CASCADE
);

CREATE INDEX idx_local_track_likes_user ON local_track_likes (user_id);
