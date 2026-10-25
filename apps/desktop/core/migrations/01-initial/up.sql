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

CREATE TABLE track_file_types (
    track_file_type_id INTEGER PRIMARY KEY,
    track_file_type_name TEXT NOT NULL UNIQUE
);

INSERT INTO
    track_file_types (track_file_type_id, track_file_type_name)
VALUES
    (0, 'audio'),
    (1, 'cover'),
    (2, 'waveform');

-- 
CREATE TABLE libraries (
    library_id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
    is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
    created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX uq_libraries_primary ON libraries (is_primary)
WHERE
    is_primary = 1;

-- 
CREATE TABLE profiles (
    profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    permalink TEXT NOT NULL UNIQUE,
    avatar_path TEXT,
    banner_path TEXT,
    bio TEXT,
    location TEXT,
    is_verified BOOLEAN DEFAULT 0,
    created_at INTEGER NOT NULL,
    last_accessed_at INTEGER NOT NULL,
    -- 
    followers_count INTEGER NOT NULL DEFAULT 0,
    following_count INTEGER NOT NULL DEFAULT 0,
    tracks_count INTEGER NOT NULL DEFAULT 0
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
CREATE TABLE tracks (
    track_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    metadata_artist TEXT,
    -- 
    duration_seconds INTEGER,
    genre TEXT,
    bpm INTEGER,
    key_signature TEXT,
    description TEXT,
    -- 
    created_at INTEGER NOT NULL
) STRICT;

CREATE INDEX idx_tracks_created ON tracks (created_at DESC);

CREATE TABLE remote_tracks (
    track_id INTEGER PRIMARY KEY REFERENCES tracks (track_id) ON DELETE CASCADE,
    remote_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    profile_id INTEGER REFERENCES profiles (profile_id) ON DELETE SET NULL,
    --
    permalink TEXT NOT NULL,
    audio_url TEXT,
    cover_url TEXT,
    waveform_url TEXT,
    is_private INTEGER NOT NULL DEFAULT 0 CHECK (is_private IN (0, 1)),
    --
    status_id INTEGER NULL REFERENCES track_statuses (status_id) ON DELETE RESTRICT,
    processing_error TEXT,
    --
    plays_count INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    reposts_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    -- 
    remote_created_at INTEGER NOT NULL,
    remote_updated_at INTEGER,
    synced_at INTEGER NOT NULL
) STRICT;

CREATE INDEX idx_remote_tracks_profile ON remote_tracks (profile_id);

CREATE TABLE track_files (
    file_id INTEGER PRIMARY KEY,
    track_id INTEGER NOT NULL REFERENCES tracks (track_id) ON DELETE CASCADE,
    track_file_type_id INTEGER NOT NULL REFERENCES track_file_types (track_file_type_id) ON DELETE RESTRICT,
    -- 
    library_id INTEGER REFERENCES libraries (library_id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    is_link INTEGER NOT NULL DEFAULT 0 CHECK (is_link IN (0, 1)),
    size_bytes INTEGER NOT NULL,
    hash TEXT,
    -- 
    last_accessed_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    -- 
    UNIQUE (track_id, track_file_type_id),
    UNIQUE (library_id, path),
    CHECK ((is_link = 1) = (library_id IS NULL))
) STRICT;

CREATE UNIQUE INDEX uq_track_files_link_path ON track_files (path)
WHERE
    library_id IS NULL;

CREATE INDEX idx_track_files_library ON track_files (library_id);

CREATE INDEX idx_track_files_hash ON track_files (hash)
WHERE
    hash IS NOT NULL;

-- 
CREATE TABLE track_artists (
    track_id INTEGER NOT NULL,
    profile_id INTEGER NOT NULL,
    PRIMARY KEY (track_id, profile_id),
    FOREIGN KEY (track_id) REFERENCES tracks (track_id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles (profile_id) ON DELETE CASCADE
);

CREATE INDEX idx_track_artists_profile ON track_artists (profile_id);

CREATE TABLE track_likes (
    profile_id INTEGER NOT NULL,
    track_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (profile_id, track_id),
    FOREIGN KEY (profile_id) REFERENCES profiles (profile_id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks (track_id) ON DELETE CASCADE
);

CREATE INDEX idx_track_likes_profile ON track_likes (profile_id);
