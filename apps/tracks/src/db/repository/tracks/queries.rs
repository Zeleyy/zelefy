use sqlx::PgExecutor;
use uuid::Uuid;
use zelefy_common::{TrackStatus, tracks::TrackWithStats};

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
                , t.waveform_url
                , t.duration_seconds
                , t.genre
                , t.description
                , t.bpm
                , t.key_signature
                , t.is_private
                , t.status AS "status: TrackStatus"
                , t.processing_error
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
                , t.waveform_url
                , t.duration_seconds
                , t.genre
                , t.description
                , t.bpm
                , t.key_signature
                , t.is_private
                , t.status AS "status: TrackStatus"
                , t.processing_error
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

pub async fn get_by_playlist_id<'e, E>(
    executor: E,
    playlist_id: Uuid,
) -> Result<Vec<TrackWithStats>, sqlx::Error>
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
                , t.waveform_url
                , t.duration_seconds
                , t.genre
                , t.description
                , t.bpm
                , t.key_signature
                , t.is_private
                , t.status AS "status: TrackStatus"
                , t.processing_error
                , t.created_at
                , t.updated_at
                , ts.plays_count
                , ts.likes_count
                , ts.reposts_count
                , ts.comments_count
            FROM playlist_tracks pt
            JOIN tracks t ON t.track_id = pt.track_id
            JOIN track_stats ts ON ts.track_id = t.track_id
            WHERE pt.playlist_id = $1
            ORDER BY pt."position" ASC
        "#,
        playlist_id
    )
    .fetch_all(executor)
    .await
}
