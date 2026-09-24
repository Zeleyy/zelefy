CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE playlists (
    playlist_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title varchar(150) NOT NULL,
    permalink citext NOT NULL,
    description text NULL,
	is_album bool DEFAULT false NOT NULL,
    cover_url text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT playlists_pk PRIMARY KEY (playlist_id),
    CONSTRAINT playlists_user_permalink_unique UNIQUE (user_id, permalink),
    CONSTRAINT playlists_permalink_format CHECK (permalink ~* '^[a-zA-Z0-9_-]+$')
);

CREATE INDEX playlists_user_id_idx ON playlists (user_id);


CREATE TABLE tracks (
    track_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title varchar(150) NOT NULL,
	permalink citext NOT NULL,
	audio_url text NOT NULL,
	cover_url text NULL,
	duration_seconds integer NOT NULL,
	genre varchar(50) NULL,
	description text NULL,
	bpm integer NULL,
	key_signature varchar(20) NULL,
	is_private boolean DEFAULT false NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT tracks_pk PRIMARY KEY (track_id),
    CONSTRAINT tracks_user_permalink_unique UNIQUE (user_id, permalink),
    CONSTRAINT tracks_permalink_format CHECK (permalink ~* '^[a-zA-Z0-9_-]+$')
);

CREATE INDEX tracks_user_id_idx ON tracks (user_id);
CREATE INDEX tracks_title_trgm_idx ON tracks USING gin (title gin_trgm_ops);


CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_tracks_updated_at
BEFORE UPDATE ON tracks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_playlists_updated_at
BEFORE UPDATE ON playlists
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE track_stats (
    track_id uuid NOT NULL,
	plays_count bigint DEFAULT 0 NOT NULL,
	likes_count integer DEFAULT 0 NOT NULL,
	reposts_count integer DEFAULT 0 NOT NULL,
	comments_count integer DEFAULT 0 NOT NULL,

    CONSTRAINT track_stats_pk PRIMARY KEY (track_id),
    CONSTRAINT track_stats_tracks_fk FOREIGN KEY (track_id) REFERENCES tracks(track_id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION create_track_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO track_stats (track_id) VALUES (NEW.track_id);
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_create_track_stats
AFTER INSERT ON tracks
FOR EACH ROW EXECUTE FUNCTION create_track_stats();


CREATE TABLE playlist_tracks (
    playlist_id uuid NOT NULL,
    track_id uuid NOT NULL,
    "position" numeric(20, 10) NOT NULL,
    added_at timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT playlist_tracks_pk PRIMARY KEY (playlist_id, track_id),
    CONSTRAINT playlist_tracks_playlist_fk FOREIGN KEY (playlist_id) REFERENCES playlists(playlist_id) ON DELETE CASCADE,
	CONSTRAINT playlist_tracks_track_fk FOREIGN KEY (track_id) REFERENCES tracks(track_id) ON DELETE CASCADE
);

CREATE INDEX playlist_tracks_order_idx ON playlist_tracks USING btree (playlist_id, "position");
CREATE INDEX playlist_tracks_track_id_idx ON playlist_tracks (track_id);


CREATE TABLE track_likes (
    user_id uuid NOT NULL,
	track_id uuid NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT track_likes_pk PRIMARY KEY (user_id, track_id),
    CONSTRAINT track_likes_track_fk FOREIGN KEY (track_id) REFERENCES tracks(track_id) ON DELETE CASCADE
);

CREATE INDEX track_likes_user_id_idx ON track_likes (user_id);

CREATE OR REPLACE FUNCTION update_track_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE track_stats SET likes_count = likes_count + 1 WHERE track_id = NEW.track_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE track_stats SET likes_count = GREATEST(0, likes_count - 1) WHERE track_id = OLD.track_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_update_track_likes_count
AFTER INSERT OR DELETE ON track_likes
FOR EACH ROW EXECUTE FUNCTION update_track_likes_count();
