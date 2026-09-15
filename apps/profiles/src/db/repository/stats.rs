use sqlx::PgExecutor;
use uuid::Uuid;

use crate::models::profile_stats::ProfileStats;

pub async fn get_by_id<'e, E>(executor: E, user_id: Uuid) -> Result<ProfileStats, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        ProfileStats,
        r#"
            SELECT
                user_id
                , followers_count
                , following_count
                , tracks_count
            FROM profile_stats
            WHERE user_id = $1
        "#,
        user_id,
    )
    .fetch_one(executor)
    .await
}
