use sqlx::{PgExecutor, QueryBuilder};
use uuid::Uuid;
use zelefy_backend::db::query_builder::push_opt_nullable;

use crate::models::playlists::{CreatePlaylistDto, Playlist, UpdatePlaylistDto};

pub async fn get_by_id<'e, E>(
    executor: E,
    playlist_id: Uuid,
) -> Result<Option<Playlist>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        Playlist,
        r#"
            SELECT
                playlist_id
                , user_id
                , title
                , permalink
                , description
                , is_album
                , cover_url
                , created_at
                , updated_at
            FROM playlists
            WHERE playlist_id = $1
        "#,
        playlist_id,
    )
    .fetch_optional(executor)
    .await
}

pub async fn get_by_permalink<'e, E>(
    executor: E,
    permalink: String,
) -> Result<Option<Playlist>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        Playlist,
        r#"
            SELECT
                playlist_id
                , user_id
                , title
                , permalink
                , description
                , is_album
                , cover_url
                , created_at
                , updated_at
            FROM playlists
            WHERE permalink = $1
        "#,
        permalink,
    )
    .fetch_optional(executor)
    .await
}

pub async fn create<'e, E>(
    executor: E,
    user_id: Uuid,
    params: CreatePlaylistDto,
) -> Result<Playlist, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        Playlist,
        r#"
            INSERT INTO playlists (
                user_id
                , title
                , permalink
                , description
                , is_album
                , cover_url
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                playlist_id
                , user_id
                , title
                , permalink
                , description
                , is_album
                , cover_url
                , created_at
                , updated_at
        "#,
        user_id,
        params.title,
        params.permalink,
        params.description,
        params.is_album,
        params.cover_url,
    )
    .fetch_one(executor)
    .await
}

pub async fn get_all_by_user_id<'e, E>(
    executor: E,
    user_id: Uuid,
) -> Result<Vec<Playlist>, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    sqlx::query_as!(
        Playlist,
        r#"
            SELECT
                playlist_id
                , user_id
                , title
                , permalink
                , description
                , is_album
                , cover_url
                , created_at
                , updated_at
            FROM playlists
            WHERE user_id = $1
            ORDER BY created_at DESC
        "#,
        user_id,
    )
    .fetch_all(executor)
    .await
}

pub async fn update<'e, E>(
    executor: E,
    playlist_id: Uuid,
    update: UpdatePlaylistDto,
) -> Result<Playlist, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    if update.is_empty() {
        return Err(sqlx::Error::Protocol(
            "UpdatePlaylistDto contained no fields to update".into(),
        ));
    }

    let mut query_builder = QueryBuilder::new("UPDATE playlists SET ");
    let mut sep = query_builder.separated(", ");

    if let Some(title) = update.title {
        sep.push("title = ").push_bind_unseparated(title);
    }

    if let Some(permalink) = update.permalink {
        sep.push("permalink = ").push_bind_unseparated(permalink);
    }

    if let Some(is_album) = update.is_album {
        sep.push("is_album = ").push_bind_unseparated(is_album);
    }

    push_opt_nullable(&mut sep, "description", update.description);
    push_opt_nullable(&mut sep, "cover_url", update.cover_url);

    query_builder.push(" WHERE playlist_id = ");
    query_builder.push_bind(playlist_id);
    query_builder.push(" RETURNING * ");

    let query = query_builder.build_query_as::<Playlist>();
    query.fetch_one(executor).await
}

pub async fn delete<'e, E>(executor: E, playlist_id: Uuid) -> Result<bool, sqlx::Error>
where
    E: PgExecutor<'e>,
{
    let result = sqlx::query!(
        r#"
            DELETE FROM playlists WHERE playlist_id = $1
        "#,
        playlist_id
    )
    .execute(executor)
    .await?;

    Ok(result.rows_affected() > 0)
}
