use rusqlite::{Connection, OptionalExtension, params};

use crate::models::jobs::Job;

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
