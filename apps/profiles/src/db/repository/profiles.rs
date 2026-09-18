use sqlx::{PgExecutor, QueryBuilder, types::Json};
use uuid::Uuid;
use zelefy_backend::db::query_builder::push_opt_nullable;

use crate::models::profiles::{CreateProfileDto, Profile, ProfileWithStats, UpdateProfileDto};

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
                , p.social_links
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
                , p.social_links
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

pub async fn create<'e, E>(
    executor: E,
    user_id: Uuid,
    params: CreateProfileDto,
) -> Result<Profile, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        Profile,
        r#"
            INSERT INTO profiles (
                user_id
                , display_name
                , permalink
                , bio
                , location
                , social_links
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                user_id
                , display_name
                , permalink
                , avatar_url
                , banner_url
                , bio
                , location
                , social_links
                , is_verified
                , created_at
                , updated_at
        "#,
        user_id,
        params.display_name,
        params.permalink,
        params.bio,
        params.location,
        Json(params.social_links) as _
    )
    .fetch_one(executor)
    .await
}

pub async fn update<'e, E>(
    executor: E,
    user_id: Uuid,
    update: UpdateProfileDto,
) -> Result<Profile, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    if update.is_empty() {
        return Err(sqlx::Error::Protocol(
            "UpdateProfileDto contained no fields to update".into(),
        ));
    }

    let mut query_builder = QueryBuilder::new("UPDATE profiles SET ");
    let mut sep = query_builder.separated(", ");

    if let Some(display_name) = update.display_name {
        sep.push("display_name = ")
            .push_bind_unseparated(display_name);
    }

    if let Some(permalink) = update.permalink {
        sep.push("permalink = ").push_bind_unseparated(permalink);
    }

    push_opt_nullable(&mut sep, "avatar_url", update.avatar_url);
    push_opt_nullable(&mut sep, "banner_url", update.banner_url);
    push_opt_nullable(&mut sep, "bio", update.bio);
    push_opt_nullable(&mut sep, "location", update.location);

    if let Some(social_links) = update.social_links {
        sep.push("social_links = ")
            .push_bind_unseparated(Json(social_links));
    }

    if let Some(is_verified) = update.is_verified {
        sep.push("is_verified = ")
            .push_bind_unseparated(is_verified);
    }

    query_builder.push(" WHERE user_id = ");
    query_builder.push_bind(user_id);
    query_builder.push(" RETURNING *");

    let query = query_builder.build_query_as::<Profile>();
    query.fetch_one(executor).await
}
