use sqlx::PgExecutor;
use zelefy_common::profiles::{DeleteFollow, Follow, NewFollow};

pub async fn create<'e, E>(executor: E, params: NewFollow) -> Result<Follow, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        Follow,
        r#"
            INSERT INTO follows (follower_id, followed_id)
            VALUES ($1, $2)
            RETURNING 
                follower_id
                , followed_id
                , created_at
        "#,
        params.follower_id,
        params.followed_id
    )
    .fetch_one(executor)
    .await
}

pub async fn delete<'e, E>(executor: E, params: DeleteFollow) -> Result<bool, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    let result = sqlx::query!(
        r#"
            DELETE FROM follows
            WHERE follower_id = $1 AND followed_id = $2
        "#,
        params.follower_id,
        params.followed_id
    )
    .execute(executor)
    .await?;

    Ok(result.rows_affected() > 0)
}
