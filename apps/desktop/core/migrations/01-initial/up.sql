CREATE TABLE track_statuses (
    status_id INTEGER PRIMARY KEY,
    status_name TEXT NOT NULL UNIQUE
) STRICT;

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
) STRICT;

INSERT INTO
    track_file_types (track_file_type_id, track_file_type_name)
VALUES
    (0, 'audio'),
    (1, 'cover'),
    (2, 'waveform');

CREATE TABLE servers (
    server_id INTEGER PRIMARY KEY,
    server_name TEXT NOT NULL,
    server_url TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL
) STRICT;

CREATE TABLE job_kinds (
    job_kind_id INTEGER PRIMARY KEY,
    job_kind_name TEXT NOT NULL UNIQUE
) STRICT;

INSERT INTO
    job_kinds (job_kind_id, job_kind_name)
VALUES
    (0, 'waveform');

CREATE TABLE job_statuses (
    job_status_id INTEGER PRIMARY KEY,
    job_status_name TEXT NOT NULL UNIQUE
) STRICT;

INSERT INTO
    job_statuses (job_status_id, job_status_name)
VALUES
    (0, 'pending'),
    (1, 'running'),
    (2, 'done'),
    (3, 'failed'),
    (4, 'cancelled');

CREATE TABLE jobs (
    job_id INTEGER PRIMARY KEY,
    job_kind_id INTEGER NOT NULL REFERENCES job_kinds (job_kind_id) ON DELETE RESTRICT,
    job_status_id INTEGER NOT NULL DEFAULT 0 REFERENCES job_statuses (job_status_id) ON DELETE RESTRICT,
    -- 
    payload TEXT NOT NULL DEFAULT '{}' CHECK (json_valid (payload)),
    dedupe_key TEXT,
    -- 
    priority INTEGER NOT NULL DEFAULT 0,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3 CHECK (max_attempts >= 1),
    error TEXT,
    -- 
    run_after INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch ('subsec') * 1000 AS INTEGER)),
    started_at INTEGER,
    finished_at INTEGER
) STRICT;

CREATE INDEX idx_jobs_claim ON jobs (priority DESC, run_after, job_id)
WHERE
    job_status_id = 0;

CREATE UNIQUE INDEX uq_jobs_dedupe_active ON jobs (job_kind_id, dedupe_key)
WHERE
    job_status_id IN (0, 1)
    AND dedupe_key IS NOT NULL;

CREATE INDEX idx_jobs_kind_status ON jobs (job_kind_id, job_status_id);

-- 
CREATE TABLE libraries (
    library_id INTEGER PRIMARY KEY,
    path TEXT NOT NULL UNIQUE,
    is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
    created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch ('subsec') * 1000 AS INTEGER))
) STRICT;

CREATE UNIQUE INDEX uq_libraries_primary ON libraries (is_primary)
WHERE
    is_primary = 1;

-- 
CREATE TABLE profiles (
    profile_id INTEGER PRIMARY KEY,
    server_id INTEGER NOT NULL REFERENCES servers (server_id) ON DELETE CASCADE,
    user_id BLOB NOT NULL CHECK (length(user_id) = 16),
    display_name TEXT NOT NULL,
    permalink TEXT NOT NULL,
    -- 
    avatar_path TEXT,
    banner_path TEXT,
    bio TEXT,
    location TEXT,
    is_verified INTEGER NOT NULL DEFAULT 0 CHECK (is_verified IN (0, 1)),
    created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch ('subsec') * 1000 AS INTEGER)),
    last_accessed_at INTEGER NOT NULL DEFAULT (CAST(unixepoch ('subsec') * 1000 AS INTEGER)),
    -- 
    followers_count INTEGER NOT NULL DEFAULT 0,
    following_count INTEGER NOT NULL DEFAULT 0,
    tracks_count INTEGER NOT NULL DEFAULT 0,
    -- 
    UNIQUE (server_id, user_id),
    UNIQUE (server_id, permalink)
) STRICT;

CREATE INDEX idx_profiles_permalink ON profiles (permalink);

CREATE INDEX idx_profiles_user_id ON profiles (user_id);

-- 
CREATE TABLE profile_social_links (
    profile_social_link_id INTEGER PRIMARY KEY,
    profile_id INTEGER NOT NULL REFERENCES profiles (profile_id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    UNIQUE (profile_id, platform)
) STRICT;

--
CREATE TABLE tracks (
    track_id INTEGER PRIMARY KEY,
    local_uuid BLOB NOT NULL UNIQUE CHECK (length(local_uuid) = 16),
    title TEXT NOT NULL,
    metadata_artist TEXT,
    -- 
    duration_ms INTEGER,
    genre TEXT,
    bpm INTEGER,
    key_signature TEXT,
    description TEXT,
    -- 
    created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch ('subsec') * 1000 AS INTEGER))
) STRICT;

CREATE INDEX idx_tracks_created ON tracks (created_at DESC);

CREATE VIRTUAL TABLE tracks_fts USING fts5 (
    title,
    metadata_artist,
    content = 'tracks',
    content_rowid = 'track_id',
    tokenize = 'trigram'
);

INSERT INTO
    tracks_fts (tracks_fts)
VALUES
    ('rebuild');

CREATE TRIGGER tracks_fts_ai
AFTER INSERT ON tracks
BEGIN
INSERT INTO
    tracks_fts (rowid, title, metadata_artist)
VALUES
    (new.track_id, new.title, new.metadata_artist);

END;

CREATE TRIGGER tracks_fts_ad
AFTER DELETE ON tracks
BEGIN
INSERT INTO
    tracks_fts (tracks_fts, rowid, title, metadata_artist)
VALUES
    (
        'delete',
        old.track_id,
        old.title,
        old.metadata_artist
    );

END;

CREATE TRIGGER tracks_fts_au
AFTER UPDATE OF title,
metadata_artist ON tracks
BEGIN
INSERT INTO
    tracks_fts (tracks_fts, rowid, title, metadata_artist)
VALUES
    (
        'delete',
        old.track_id,
        old.title,
        old.metadata_artist
    );

INSERT INTO
    tracks_fts (rowid, title, metadata_artist)
VALUES
    (new.track_id, new.title, new.metadata_artist);

END;

CREATE TABLE remote_tracks (
    track_id INTEGER PRIMARY KEY REFERENCES tracks (track_id) ON DELETE CASCADE,
    server_id INTEGER NOT NULL REFERENCES servers (server_id) ON DELETE CASCADE,
    remote_id BLOB NOT NULL CHECK (length(remote_id) = 16),
    user_id BLOB NOT NULL CHECK (length(user_id) = 16),
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
    synced_at INTEGER NOT NULL DEFAULT (CAST(unixepoch ('subsec') * 1000 AS INTEGER)),
    -- 
    UNIQUE (server_id, remote_id)
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
    last_accessed_at INTEGER NOT NULL DEFAULT (CAST(unixepoch ('subsec') * 1000 AS INTEGER)),
    created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch ('subsec') * 1000 AS INTEGER)),
    -- 
    UNIQUE (track_id, track_file_type_id),
    UNIQUE (library_id, path),
    CHECK ((is_link = 1) = (library_id IS NULL))
) STRICT;

CREATE UNIQUE INDEX uq_track_files_link_path ON track_files (path)
WHERE
    library_id IS NULL;

CREATE INDEX idx_track_files_hash ON track_files (hash)
WHERE
    hash IS NOT NULL;

-- 
CREATE TABLE track_artists (
    track_id INTEGER NOT NULL REFERENCES tracks (track_id) ON DELETE CASCADE,
    profile_id INTEGER NOT NULL REFERENCES profiles (profile_id) ON DELETE CASCADE,
    PRIMARY KEY (track_id, profile_id)
) STRICT,
WITHOUT ROWID;

CREATE INDEX idx_track_artists_profile ON track_artists (profile_id);

CREATE TABLE track_likes (
    profile_id INTEGER NOT NULL REFERENCES profiles (profile_id) ON DELETE CASCADE,
    track_id INTEGER NOT NULL REFERENCES tracks (track_id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (profile_id, track_id)
) STRICT,
WITHOUT ROWID;

CREATE TABLE playlists (
    playlist_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch ('subsec') * 1000 AS INTEGER))
) STRICT;

CREATE TABLE remote_playlists (
    playlist_id INTEGER PRIMARY KEY REFERENCES playlists (playlist_id) ON DELETE CASCADE,
    server_id INTEGER NOT NULL REFERENCES servers (server_id) ON DELETE CASCADE,
    remote_id BLOB NOT NULL CHECK (length(remote_id) = 16),
    user_id BLOB NOT NULL CHECK (length(user_id) = 16),
    profile_id INTEGER REFERENCES profiles (profile_id) ON DELETE SET NULL,
    -- 
    permalink TEXT NOT NULL,
    cover_url TEXT,
    is_album INTEGER NOT NULL DEFAULT 0 CHECK (is_album IN (0, 1)),
    is_private INTEGER NOT NULL DEFAULT 0 CHECK (is_private IN (0, 1)),
    -- 
    remote_created_at INTEGER NOT NULL,
    remote_updated_at INTEGER,
    synced_at INTEGER NOT NULL DEFAULT (CAST(unixepoch ('subsec') * 1000 AS INTEGER)),
    -- 
    UNIQUE (server_id, remote_id)
) STRICT;

CREATE INDEX idx_remote_playlists_profile ON remote_playlists (profile_id);

CREATE TABLE playlist_tracks (
    playlist_id INTEGER NOT NULL REFERENCES playlists (playlist_id) ON DELETE CASCADE,
    track_id INTEGER NOT NULL REFERENCES tracks (track_id) ON DELETE CASCADE,
    position REAL NOT NULL,
    added_at INTEGER NOT NULL DEFAULT (CAST(unixepoch ('subsec') * 1000 AS INTEGER)),
    PRIMARY KEY (playlist_id, track_id)
) STRICT,
WITHOUT ROWID;

CREATE INDEX idx_playlist_tracks_order ON playlist_tracks (playlist_id, position);

CREATE INDEX idx_playlist_tracks_track ON playlist_tracks (track_id);
