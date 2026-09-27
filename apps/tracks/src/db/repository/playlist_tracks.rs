use sqlx::PgExecutor;
use uuid::Uuid;

pub async fn add_track<'e, E>(
    executor: E,
    playlist_id: Uuid,
    track_id: Uuid,
    position: bigdecimal::BigDecimal,
) -> Result<(), sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query!(
        r#"
            INSERT INTO playlist_tracks (playlist_id, track_id, "position")
            VALUES ($1, $2, $3)
        "#,
        playlist_id,
        track_id,
        position,
    )
    .execute(executor)
    .await?;

    Ok(())
}

pub async fn remove_track<'e, E>(
    executor: E,
    playlist_id: Uuid,
    track_id: Uuid,
) -> Result<bool, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    let result = sqlx::query!(
        r#"
            DELETE FROM playlist_tracks
            WHERE playlist_id = $1 AND track_id = $2
        "#,
        playlist_id,
        track_id,
    )
    .execute(executor)
    .await?;

    Ok(result.rows_affected() > 0)
}

pub async fn get_position<'e, E>(
    executor: E,
    playlist_id: Uuid,
    track_id: Uuid,
) -> Result<Option<bigdecimal::BigDecimal>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_scalar!(
        r#"
            SELECT "position" FROM playlist_tracks WHERE playlist_id = $1 AND track_id = $2
        "#,
        playlist_id,
        track_id,
    )
    .fetch_optional(executor)
    .await
}

pub async fn get_max_position<'e, E>(
    executor: E,
    playlist_id: Uuid,
) -> Result<Option<bigdecimal::BigDecimal>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_scalar!(
        r#"
            SELECT MAX("position") FROM playlist_tracks WHERE playlist_id = $1
        "#,
        playlist_id,
    )
    .fetch_one(executor)
    .await
}

pub async fn update_position<'e, E>(
    executor: E,
    playlist_id: Uuid,
    track_id: Uuid,
    position: bigdecimal::BigDecimal,
) -> Result<bool, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    let result = sqlx::query!(
        r#"
            UPDATE playlist_tracks
            SET "position" = $3
            WHERE playlist_id = $1 AND track_id = $2
        "#,
        playlist_id,
        track_id,
        position,
    )
    .execute(executor)
    .await?;

    Ok(result.rows_affected() > 0)
}
