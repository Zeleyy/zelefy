use sqlx::{PgExecutor, QueryBuilder};
use uuid::Uuid;
use zelefy_backend::db::query_builder::push_opt_nullable;
use zelefy_common::{
    TrackStatus,
    tracks::{NewTrack, Track, UpdateTrack},
};

pub async fn create<'e, E>(
    executor: E,
    user_id: Uuid,
    params: NewTrack,
) -> Result<Track, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        Track,
        r#"
            INSERT INTO tracks (
                user_id
                , permalink
                , title
            )
            VALUES ($1, $2, $3)
            RETURNING
                track_id
                , user_id
                , title
                , permalink
                , audio_url
                , cover_url
                , waveform_url
                , duration_seconds
                , genre
                , description
                , bpm
                , key_signature
                , is_private
                , status AS "status: TrackStatus"
                , processing_error
                , created_at
                , updated_at
        "#,
        user_id,
        params.permalink,
        params.title
    )
    .fetch_one(executor)
    .await
}

pub async fn update<'e, E>(
    executor: E,
    track_id: Uuid,
    update: UpdateTrack,
) -> Result<Option<Track>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    debug_assert!(
        !update.is_empty(),
        "update() called with an empty UpdateTrack — check should happen in the service layer"
    );

    let mut query_builder = QueryBuilder::new("UPDATE tracks SET ");
    let mut sep = query_builder.separated(", ");

    if let Some(title) = update.title {
        sep.push("title = ").push_bind_unseparated(title);
    }

    if let Some(permalink) = update.permalink {
        sep.push("permalink = ").push_bind_unseparated(permalink);
    }

    if let Some(is_private) = update.is_private {
        sep.push("is_private = ").push_bind_unseparated(is_private);
    }

    if let Some(status) = update.status {
        sep.push("status = ").push_bind_unseparated(status);
    }

    push_opt_nullable(&mut sep, "audio_url", update.audio_url);
    push_opt_nullable(&mut sep, "cover_url", update.cover_url);
    push_opt_nullable(&mut sep, "waveform_url", update.waveform_url);
    push_opt_nullable(&mut sep, "duration_seconds", update.duration_seconds);
    push_opt_nullable(&mut sep, "genre", update.genre);
    push_opt_nullable(&mut sep, "description", update.description);
    push_opt_nullable(&mut sep, "bpm", update.bpm);
    push_opt_nullable(&mut sep, "key_signature", update.key_signature);
    push_opt_nullable(&mut sep, "processing_error", update.processing_error);

    query_builder.push(" WHERE track_id = ");
    query_builder.push_bind(track_id);
    query_builder.push(" RETURNING * ");

    let query = query_builder.build_query_as::<Track>();
    query.fetch_optional(executor).await
}
