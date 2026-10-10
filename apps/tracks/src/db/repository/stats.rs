use sqlx::PgExecutor;
use uuid::Uuid;
use zelefy_common::tracks::TrackStats;

pub async fn get_by_id<'e, E>(
    executor: E,
    track_id: Uuid,
) -> Result<Option<TrackStats>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        TrackStats,
        r#"
            SELECT
                track_id
                , plays_count
                , likes_count
                , reposts_count
                , comments_count
            FROM track_stats
            WHERE track_id = $1
        "#,
        track_id,
    )
    .fetch_optional(executor)
    .await
}
