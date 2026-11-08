use rusqlite::{Connection, OptionalExtension, params};

use crate::models::jobs::{Job, JobCursor, JobStatus};

pub fn get_by_id(conn: &Connection, job_id: i64) -> rusqlite::Result<Option<Job>> {
    conn.query_one(
        r#"
            SELECT
                job_id
                , job_kind_id
                , job_status_id
                , payload
                , dedupe_key
                , priority
                , attempts
                , max_attempts
                , error
                , run_after
                , created_at
                , started_at
                , finished_at
            FROM jobs
            WHERE job_id = ?1
        "#,
        params![job_id],
        Job::row_to_job,
    )
    .optional()
}

pub fn get_page(
    conn: &Connection,
    after: Option<JobCursor>,
    limit: u32,
) -> rusqlite::Result<Vec<Job>> {
    let mut stmt = conn.prepare_cached(
        r#"
            SELECT
                job_id
                , job_kind_id
                , job_status_id
                , payload
                , dedupe_key
                , priority
                , attempts
                , max_attempts
                , error
                , run_after
                , created_at
                , started_at
                , finished_at
            FROM jobs
            WHERE (?1 IS NULL OR job_id < ?1)
            ORDER BY job_id DESC
            LIMIT ?2
        "#,
    )?;

    let job_id = after.map(|a| a.job_id);

    stmt.query_map(params![job_id, limit], Job::row_to_job)?
        .collect()
}

pub fn get_active(conn: &Connection) -> rusqlite::Result<Vec<Job>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
            job_id
            , job_kind_id
            , job_status_id
            , payload
            , dedupe_key
            , priority
            , attempts
            , max_attempts
            , error
            , run_after
            , created_at
            , started_at
            , finished_at
        FROM jobs
        WHERE job_status_id IN (?1, ?2)
        ORDER BY priority DESC, job_id
    "#,
    )?;

    stmt.query_map(
        params![JobStatus::Pending, JobStatus::Running],
        Job::row_to_job,
    )?
    .collect::<rusqlite::Result<_>>()
}
