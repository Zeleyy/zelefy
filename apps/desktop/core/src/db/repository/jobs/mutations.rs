use chrono::Utc;
use rusqlite::{Connection, OptionalExtension, params, params_from_iter, types::Value};

use crate::{
    db::utils::push_opt_nullable,
    models::jobs::{Job, JobStatus, NewJob, UpdateJob},
};

pub fn create(conn: &Connection, job: &NewJob) -> rusqlite::Result<i64> {
    let now = Utc::now().timestamp();
    let run_after = job.run_after.unwrap_or_else(Utc::now).timestamp();

    conn.query_row(
        r#"
            INSERT INTO jobs (
                job_kind_id,
                job_status_id,
                payload,
                dedupe_key,
                priority,
                attempts,
                max_attempts,
                run_after,
                created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            RETURNING job_id
        "#,
        params![
            job.job_kind,
            job.job_status,
            job.payload,
            job.dedupe_key,
            job.priority,
            job.attempts,
            job.max_attempts,
            run_after,
            now,
        ],
        |row| row.get(0),
    )
}

pub fn update(conn: &Connection, job_id: i64, update: &UpdateJob) -> rusqlite::Result<bool> {
    let mut set_parts: Vec<String> = Vec::new();
    let mut values: Vec<Value> = Vec::new();

    if let Some(job_status) = update.job_status {
        set_parts.push("job_status_id = ?".to_string());
        values.push(Value::Integer(job_status as i64));
    }

    if let Some(attempts) = update.attempts {
        set_parts.push("attempts = ?".to_string());
        values.push(Value::Integer(attempts));
    }

    if let Some(run_after) = update.run_after {
        set_parts.push("run_after = ?".to_string());
        values.push(Value::Integer(run_after.timestamp()));
    }

    push_opt_nullable(&mut set_parts, &mut values, "error", update.error.clone());
    push_opt_nullable(
        &mut set_parts,
        &mut values,
        "started_at",
        update.started_at.map(|o| o.map(|dt| dt.timestamp())),
    );
    push_opt_nullable(
        &mut set_parts,
        &mut values,
        "finished_at",
        update.finished_at.map(|o| o.map(|dt| dt.timestamp())),
    );

    if set_parts.is_empty() {
        return Ok(false);
    }

    let sql = format!("UPDATE jobs SET {} WHERE job_id = ?", set_parts.join(", "));

    values.push(Value::Integer(job_id));

    let mut stmt = conn.prepare(&sql)?;
    Ok(stmt.execute(params_from_iter(values))? > 0)
}

pub fn complete(conn: &Connection, job_id: i64) -> rusqlite::Result<bool> {
    update(
        conn,
        job_id,
        &UpdateJob {
            job_status: Some(JobStatus::Done),
            finished_at: Some(Some(Utc::now())),
            ..Default::default()
        },
    )
}

pub fn fail(conn: &Connection, job_id: i64, error: String) -> rusqlite::Result<bool> {
    let now = Utc::now().timestamp();
    let backoff = 5 * 60;

    let updated = conn.execute(
        r#"
            UPDATE jobs
            SET job_status_id = CASE
                    WHEN attempts < max_attempts THEN ?2
                    ELSE ?3
                END,
                error = ?4,
                run_after = CASE
                    WHEN attempts < max_attempts THEN ?5  -- now + backoff
                    ELSE run_after
                END,
                started_at = CASE
                    WHEN attempts < max_attempts THEN NULL
                    ELSE started_at
                END,
                finished_at = CASE
                    WHEN attempts < max_attempts THEN NULL
                    ELSE ?6
                END
            WHERE job_id = ?1
        "#,
        params![
            job_id,
            JobStatus::Pending,
            JobStatus::Failed,
            error,
            now + backoff,
            now,
        ],
    )?;

    Ok(updated > 0)
}

pub fn cancel(conn: &Connection, job_id: i64) -> rusqlite::Result<bool> {
    update(
        conn,
        job_id,
        &UpdateJob {
            job_status: Some(JobStatus::Cancelled),
            finished_at: Some(Some(Utc::now())),
            ..Default::default()
        },
    )
}

pub fn claim_next(conn: &Connection) -> rusqlite::Result<Option<Job>> {
    conn.query_row(
        r#"
            UPDATE jobs
            SET job_status_id = ?1, started_at = ?2, attempts = attempts + 1
            WHERE job_id = (
                SELECT job_id FROM jobs
                WHERE job_status_id = 0 AND run_after <= ?2
                ORDER BY priority DESC, run_after, job_id
                LIMIT 1
            )
            RETURNING
                job_id, job_kind_id, job_status_id
                , payload, dedupe_key, priority
                , attempts, max_attempts, error
                , run_after, created_at, started_at, finished_at
        "#,
        params![JobStatus::Running, Utc::now().timestamp()],
        Job::row_to_job,
    )
    .optional()
}

pub fn recover_running(conn: &Connection) -> rusqlite::Result<usize> {
    conn.execute(
        r#"
            UPDATE jobs
            SET job_status_id = CASE WHEN attempts < max_attempts THEN ?1 ELSE ?2 END,
                error = CASE WHEN attempts < max_attempts THEN error ELSE 'interrupted' END,
                finished_at = CASE WHEN attempts < max_attempts THEN NULL ELSE ?3 END,
                started_at = NULL
            WHERE job_status_id = ?4
        "#,
        params![
            JobStatus::Pending,
            JobStatus::Failed,
            Utc::now().timestamp(),
            JobStatus::Running
        ],
    )
}
