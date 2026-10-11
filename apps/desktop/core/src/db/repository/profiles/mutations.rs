use rusqlite::{Connection, params};
use zelefy_common::profiles::ProfileDetails;

pub fn upsert(conn: &Connection, profile: &ProfileDetails) -> rusqlite::Result<()> {
    let last_accessed_at = chrono::Utc::now().timestamp();

    let profile_id: i64 = conn.query_row(
        r#"
            INSERT INTO profiles (
                user_id, display_name, permalink,
                avatar_path, banner_path, bio, location, is_verified, 
                created_at, last_accessed_at,
                followers_count, following_count, tracks_count
            ) VALUES (
                ?1, ?2, ?3,
                ?4, ?5, ?6, ?7, ?8,
                ?9, ?10,
                ?11, ?12, ?13
            ) ON CONFLICT (user_id) DO UPDATE SET
                display_name = excluded.display_name
                , permalink = excluded.permalink
                , avatar_path = excluded.avatar_path
                , banner_path = excluded.banner_path
                , bio = excluded.bio
                , location = excluded.location
                , is_verified = excluded.is_verified
                , last_accessed_at = excluded.last_accessed_at
                , followers_count = excluded.followers_count
                , following_count = excluded.following_count
                , tracks_count = excluded.tracks_count
            RETURNING profile_id
        "#,
        params![
            profile.user_id,
            profile.display_name,
            profile.permalink,
            profile.avatar_url,
            profile.banner_url,
            profile.bio,
            profile.location,
            profile.is_verified,
            profile.created_at.timestamp(),
            last_accessed_at,
            profile.followers_count,
            profile.following_count,
            profile.tracks_count
        ],
        |row| row.get(0),
    )?;

    conn.execute(
        "DELETE FROM profile_social_links WHERE profile_id = ?1",
        params![profile_id],
    )?;

    for link in &profile.social_links {
        conn.execute(
            r#"
                INSERT INTO profile_social_links (profile_id, platform, url)
                VALUES (?1, ?2, ?3)
            "#,
            params![profile_id, link.platform, link.url],
        )?;
    }

    Ok(())
}
