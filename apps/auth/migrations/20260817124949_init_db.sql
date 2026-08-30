CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro_plus', 'pro_unlimited');

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';


CREATE TABLE users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    email citext NOT NULL,
    password_hash varchar(255) NOT NULL,
    subscription subscription_tier DEFAULT 'free' NOT NULL,
    role user_role DEFAULT 'user' NOT NULL,

    is_blocked bool DEFAULT false NOT NULL,

    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT users_pk PRIMARY KEY (user_id),
    CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE user_sessions (
    session_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,

    refresh_token_hash varchar(64) NOT NULL,

    device_info varchar(255) NULL,
    ip_address inet NULL,

    is_revoked bool DEFAULT false NOT NULL,
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT user_sessions_pk PRIMARY KEY (session_id),
    CONSTRAINT user_sessions_users_fk FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions (user_id) WHERE NOT is_revoked;

CREATE UNIQUE INDEX idx_user_sessions_active_hash ON user_sessions (refresh_token_hash) WHERE NOT is_revoked;
