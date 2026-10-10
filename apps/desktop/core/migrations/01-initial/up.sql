CREATE TABLE storage_types (
    storage_type_id INTEGER PRIMARY KEY,
    storage_type TEXT NOT NULL UNIQUE
);

INSERT INTO
    storage_types (storage_type_id, storage_type)
VALUES
    (0, 'cache'),
    (1, 'library');

-- 
CREATE TABLE track_statuses (
    status_id INTEGER PRIMARY KEY,
    status_name TEXT NOT NULL UNIQUE
);

INSERT INTO
    track_statuses (status_id, status_name)
VALUES
    (0, 'processing'),
    (1, 'ready'),
    (2, 'failed'),
    (3, 'published');

-- 
CREATE TABLE storages (
    storage_id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
    storage_type_id INTEGER NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT 0,
    max_size_bytes INTEGER,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (storage_type_id) REFERENCES storage_types (storage_type_id) ON DELETE RESTRICT
);

-- 
CREATE TABLE profiles (
    profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
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

CREATE INDEX idx_profiles_user_id ON profiles (user_id);

-- 
CREATE TABLE profile_social_links (
    profile_social_link_id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles (profile_id) ON DELETE CASCADE,
    CONSTRAINT uq_profile_platform UNIQUE (profile_id, platform)
);

CREATE INDEX idx_profile_social_links_profile ON profile_social_links (profile_id);

-- 
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

-- 
CREATE TABLE local_tracks (
    track_id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NULL UNIQUE,
    -- 
    remote_track_id TEXT UNIQUE,
    profile_id INTEGER NULL,
    -- 
    title TEXT NOT NULL,
    permalink TEXT NOT NULL,
    audio_url TEXT,
    cover_url TEXT,
    waveform_url TEXT,
    duration_seconds INTEGER,
    -- 
    genre TEXT,
    description TEXT,
    bpm INTEGER,
    key_signature TEXT,
    is_private BOOLEAN NOT NULL DEFAULT 0,
    -- 
    status_id INTEGER NULL,
    processing_error TEXT,
    -- 
    plays_count INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    reposts_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    -- 
    created_at INTEGER NOT NULL,
    updated_at INTEGER,
    -- 
    FOREIGN KEY (file_id) REFERENCES local_files (file_id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles (profile_id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES track_statuses (status_id) ON DELETE RESTRICT
);

CREATE INDEX idx_local_tracks_profile ON local_tracks (profile_id);

CREATE INDEX idx_local_tracks_remote_id ON local_tracks (remote_track_id);

-- 
CREATE TABLE track_artists (
    track_id INTEGER NOT NULL,
    profile_id INTEGER NOT NULL,
    PRIMARY KEY (track_id, profile_id),
    FOREIGN KEY (track_id) REFERENCES local_tracks (track_id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles (profile_id) ON DELETE CASCADE
);

CREATE INDEX idx_track_artists_profile ON track_artists (profile_id);

CREATE TABLE local_track_likes (
    profile_id INTEGER NOT NULL,
    track_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (profile_id, track_id),
    FOREIGN KEY (profile_id) REFERENCES profiles (profile_id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES local_tracks (track_id) ON DELETE CASCADE
);

CREATE INDEX idx_local_track_likes_profile ON local_track_likes (profile_id);
