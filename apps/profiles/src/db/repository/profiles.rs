use sqlx::{PgExecutor, QueryBuilder, types::Json};
use uuid::Uuid;

use crate::models::profiles::{CreateProfileDto, Profile, UpdateProfileDto};

pub async fn get_by_id<'e, E>(
    executor: E,
    user_id: Uuid,
) -> Result<Option<Profile>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        Profile,
        r#"
            SELECT
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
            FROM profiles
            WHERE user_id = $1
        "#,
        user_id
    )
    .fetch_optional(executor)
    .await
}

pub async fn create<'e, E>(
    executor: E,
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
                , avatar_url
                , bio
                , location
                , social_links
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
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
        params.user_id,
        params.display_name,
        params.permalink,
        params.avatar_url,
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
    params: UpdateProfileDto,
) -> Result<Profile, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    let mut query_builder = QueryBuilder::new("UPDATE profiles SET ");
    let mut separated = query_builder.separated(", ");

    if let Some(display_name) = params.display_name {
        separated.push("display_name = ");
        separated.push_bind(display_name);
    }

    if let Some(permalink) = params.permalink {
        separated.push("permalink = ");
        separated.push_bind(permalink);
    }

    if let Some(avatar_url) = params.avatar_url {
        match avatar_url {
            Some(url) => {
                separated.push("avatar_url = ");
                separated.push_bind(url);
            }
            None => {
                separated.push("avatar_url = NULL");
            }
        }
    }

    if let Some(banner_url) = params.banner_url {
        match banner_url {
            Some(url) => {
                separated.push("banner_url = ");
                separated.push_bind(url);
            }
            None => {
                separated.push("banner_url = NULL");
            }
        }
    }

    if let Some(bio) = params.bio {
        match bio {
            Some(url) => {
                separated.push("bio = ");
                separated.push_bind(url);
            }
            None => {
                separated.push("bio = NULL");
            }
        }
    }

    if let Some(location) = params.location {
        match location {
            Some(url) => {
                separated.push("location = ");
                separated.push_bind(url);
            }
            None => {
                separated.push("location = NULL");
            }
        }
    }

    if let Some(social_links) = params.social_links {
        separated.push("social_links = ");
        separated.push_bind(Json(social_links));
    }

    if let Some(is_verified) = params.is_verified {
        separated.push("is_verified = ");
        separated.push_bind(is_verified);
    }

    query_builder.push(" WHERE user_id = ");
    query_builder.push_bind(user_id);
    query_builder.push(" RETURNING *");

    let query = query_builder.build_query_as::<Profile>();
    query.fetch_one(executor).await
}
