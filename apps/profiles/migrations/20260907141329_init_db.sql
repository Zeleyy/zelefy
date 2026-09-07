CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE profiles (
    user_id uuid NOT NULL,
    display_name varchar(100) NOT NULL,
    permalink citext NOT NULL,
    avatar_url text NULL,
	banner_url text NULL,
    bio text NULL,
	"location" varchar(100) NULL,
	social_links jsonb DEFAULT '{}'::jsonb NOT NULL,
	is_verified boolean DEFAULT false NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT profiles_pk PRIMARY KEY (user_id),
    CONSTRAINT profiles_unique UNIQUE (permalink),
    CONSTRAINT profiles_permalink_format CHECK (permalink ~* '^[a-zA-Z0-9_-]+$')
);

CREATE INDEX profiles_display_name_idx ON profiles USING gin (display_name gin_trgm_ops);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE profile_stats (
    user_id uuid NOT NULL,
    followers_count integer DEFAULT 0 NOT NULL,
    following_count integer DEFAULT 0 NOT NULL,
    tracks_count integer DEFAULT 0 NOT NULL,

    CONSTRAINT profile_stats_pk PRIMARY KEY (user_id),
    CONSTRAINT profile_stats_profiles_fk FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION create_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profile_stats (user_id) VALUES (NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_create_profile_stats
AFTER INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION create_profile_stats();


CREATE TABLE follows (
    follower_id uuid NOT NULL,
    followed_id uuid NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT follows_pk PRIMARY KEY (follower_id, followed_id),
    CONSTRAINT follows_self_follow_check CHECK (follower_id <> followed_id),
    CONSTRAINT follows_follower_fk FOREIGN KEY (follower_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
    CONSTRAINT follows_followed_fk FOREIGN KEY (followed_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

CREATE INDEX follows_followed_id_idx ON follows (followed_id);


CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE profile_stats SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
        UPDATE profile_stats SET followers_count = followers_count + 1 WHERE user_id = NEW.followed_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE profile_stats SET following_count = GREATEST(0, following_count - 1) WHERE user_id = OLD.follower_id;
        UPDATE profile_stats SET followers_count = GREATEST(0, followers_count - 1) WHERE user_id = OLD.followed_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_update_follow_counts
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();
