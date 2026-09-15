use sqlx::PgExecutor;

use crate::models::follows::{CreateFollowDto, DeleteFollowDto, Follow};

pub async fn create<'e, E>(executor: E, params: CreateFollowDto) -> Result<Follow, sqlx::Error>
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

pub async fn delete<'e, E>(executor: E, params: DeleteFollowDto) -> Result<bool, sqlx::Error>
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
