use sqlx::{PgExecutor, QueryBuilder};
use uuid::Uuid;
use zelefy_backend::db::query_builder::push_opt_nullable;
use zelefy_common::profiles::{NewProfile, Profile, UpdateProfile};

pub async fn create<'e, E>(
    executor: E,
    user_id: Uuid,
    params: NewProfile,
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
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
                user_id
                , display_name
                , permalink
                , avatar_url
                , banner_url
                , bio
                , location
                , is_verified
                , created_at
                , updated_at
        "#,
        user_id,
        params.display_name,
        params.permalink,
        params.bio,
        params.location
    )
    .fetch_one(executor)
    .await
}

pub async fn update<'e, E>(
    executor: E,
    user_id: Uuid,
    update: UpdateProfile,
) -> Result<Option<Profile>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    debug_assert!(
        !update.is_empty(),
        "update() called with an empty UpdateProfileDto — check should happen in the service layer"
    );

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

    if let Some(is_verified) = update.is_verified {
        sep.push("is_verified = ")
            .push_bind_unseparated(is_verified);
    }

    query_builder.push(" WHERE user_id = ");
    query_builder.push_bind(user_id);
    query_builder.push(" RETURNING *");

    let query = query_builder.build_query_as::<Profile>();
    query.fetch_optional(executor).await
}
