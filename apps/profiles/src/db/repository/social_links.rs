use sqlx::PgExecutor;
use uuid::Uuid;
use zelefy_common::profiles::{DeleteProfileSocialLink, NewProfileSocialLink, ProfileSocialLink};

pub async fn get_by_id<'e, E>(
    executor: E,
    user_id: Uuid,
) -> Result<Vec<ProfileSocialLink>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        ProfileSocialLink,
        r#"
            SELECT
                user_id
                , platform
                , url
            FROM profile_social_links
            WHERE user_id = $1
        "#,
        user_id
    )
    .fetch_all(executor)
    .await
}

pub async fn add<'e, E>(
    executor: E,
    user_id: Uuid,
    params: Vec<NewProfileSocialLink>,
) -> Result<Vec<ProfileSocialLink>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    let (platforms, urls): (Vec<String>, Vec<String>) =
        params.into_iter().map(|s| (s.platform, s.url)).unzip();

    let user_ids = vec![user_id; platforms.len()];

    sqlx::query_as!(
        ProfileSocialLink,
        r#"
            INSERT INTO profile_social_links (user_id, platform, url)
            SELECT * FROM UNNEST($1::uuid[], $2::text[], $3::text[])
            RETURNING user_id, platform, url
        "#,
        &user_ids[..],
        &platforms[..],
        &urls[..],
    )
    .fetch_all(executor)
    .await
}

pub async fn delete<'e, E>(
    executor: E,
    user_id: Uuid,
    params: Vec<DeleteProfileSocialLink>,
) -> Result<Vec<ProfileSocialLink>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    let platforms: Vec<String> = params.into_iter().map(|s| s.platform).collect();
    let user_ids = vec![user_id; platforms.len()];

    sqlx::query_as!(
        ProfileSocialLink,
        r#"
            DELETE FROM profile_social_links AS psl
            USING (
                SELECT * FROM UNNEST($1::uuid[], $2::text[])
                AS t(user_id, platform)
            ) AS del
            WHERE psl.user_id = del.user_id
              AND psl.platform = del.platform
            RETURNING psl.user_id, psl.platform, psl.url
        "#,
        &user_ids[..],
        &platforms[..],
    )
    .fetch_all(executor)
    .await
}
