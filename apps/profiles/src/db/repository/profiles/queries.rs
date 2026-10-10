use sqlx::PgExecutor;
use uuid::Uuid;
use zelefy_common::profiles::ProfileWithStats;

pub async fn get_by_id<'e, E>(
    executor: E,
    user_id: Uuid,
) -> Result<Option<ProfileWithStats>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        ProfileWithStats,
        r#"
            SELECT
                p.user_id
                , p.display_name
                , p.permalink
                , p.avatar_url
                , p.banner_url
                , p.bio
                , p.location
                , p.is_verified
                , p.created_at
                , p.updated_at
                , ps.followers_count
                , ps.following_count
                , ps.tracks_count
            FROM profiles p
            JOIN profile_stats ps ON ps.user_id = p.user_id
            WHERE p.user_id = $1
        "#,
        user_id
    )
    .fetch_optional(executor)
    .await
}

pub async fn get_by_permalink<'e, E>(
    executor: E,
    permalink: String,
) -> Result<Option<ProfileWithStats>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        ProfileWithStats,
        r#"
            SELECT
                p.user_id
                , p.display_name
                , p.permalink
                , p.avatar_url
                , p.banner_url
                , p.bio
                , p.location
                , p.is_verified
                , p.created_at
                , p.updated_at
                , ps.followers_count
                , ps.following_count
                , ps.tracks_count
            FROM profiles p
            JOIN profile_stats ps ON ps.user_id = p.user_id
            WHERE p.permalink = $1
        "#,
        permalink
    )
    .fetch_optional(executor)
    .await
}
