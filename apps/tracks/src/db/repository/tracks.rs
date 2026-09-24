use sqlx::PgExecutor;
use uuid::Uuid;

use crate::models::tracks::{CreateTrackDto, Track, TrackWithStats};

pub async fn get_by_id<'e, E>(
    executor: E,
    track_id: Uuid,
) -> Result<Option<TrackWithStats>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        TrackWithStats,
        r#"
            SELECT
                t.track_id
                , t.user_id
                , t.title
                , t.permalink
                , t.audio_url
                , t.cover_url
                , t.duration_seconds
                , t.genre
                , t.description
                , t.bpm
                , t.key_signature
                , t.is_private
                , t.created_at
                , t.updated_at
                , ts.plays_count
                , ts.likes_count
                , ts.reposts_count
                , ts.comments_count
            FROM tracks t
            JOIN track_stats ts ON ts.track_id = t.track_id
            WHERE t.track_id = $1
        "#,
        track_id
    )
    .fetch_optional(executor)
    .await
}

pub async fn get_by_permalink<'e, E>(
    executor: E,
    permalink: String,
) -> Result<Option<TrackWithStats>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        TrackWithStats,
        r#"
            SELECT
                t.track_id
                , t.user_id
                , t.title
                , t.permalink
                , t.audio_url
                , t.cover_url
                , t.duration_seconds
                , t.genre
                , t.description
                , t.bpm
                , t.key_signature
                , t.is_private
                , t.created_at
                , t.updated_at
                , ts.plays_count
                , ts.likes_count
                , ts.reposts_count
                , ts.comments_count
            FROM tracks t
            JOIN track_stats ts ON ts.track_id = t.track_id
            WHERE t.permalink = $1
        "#,
        permalink
    )
    .fetch_optional(executor)
    .await
}

pub async fn create<'e, E>(
    executor: E,
    user_id: Uuid,
    params: CreateTrackDto,
) -> Result<Track, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        Track,
        r#"
            INSERT INTO tracks (
                user_id
                , title
                , permalink
                , audio_url
                , cover_url
                , duration_seconds
                , genre
                , description
                , bpm
                , key_signature
                , is_private
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING
                track_id
                , user_id
                , title
                , permalink
                , audio_url
                , cover_url
                , duration_seconds
                , genre
                , description
                , bpm
                , key_signature
                , is_private
                , created_at
                , updated_at
        "#,
        user_id,
        params.title,
        params.permalink,
        params.audio_url,
        params.cover_url,
        params.duration_seconds,
        params.genre,
        params.description,
        params.bpm,
        params.key_signature,
        params.is_private
    )
    .fetch_one(executor)
    .await
}
