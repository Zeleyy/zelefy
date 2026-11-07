use chrono::{DateTime, Utc};
use rusqlite::{
    Error::ToSqlConversionFailure,
    Row, ToSql,
    types::{FromSql, FromSqlError, ToSqlOutput},
};
use serde::{Deserialize, Serialize};

#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum JobKind {
    Waveform = 0,
}

impl ToSql for JobKind {
    fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
        Ok(ToSqlOutput::from(*self as i64))
    }
}

impl FromSql for JobKind {
    fn column_result(value: rusqlite::types::ValueRef<'_>) -> rusqlite::types::FromSqlResult<Self> {
        let int_val = u8::column_result(value)?;
        match int_val {
            0 => Ok(JobKind::Waveform),
            other => Err(FromSqlError::OutOfRange(other as i64)),
        }
    }
}

#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum JobStatus {
    Pending = 0,
    Running = 1,
    Done = 2,
    Failed = 3,
    Cancelled = 4,
}

impl ToSql for JobStatus {
    fn to_sql(&self) -> rusqlite::Result<ToSqlOutput<'_>> {
        Ok(ToSqlOutput::from(*self as i64))
    }
}

impl FromSql for JobStatus {
    fn column_result(value: rusqlite::types::ValueRef<'_>) -> rusqlite::types::FromSqlResult<Self> {
        let int_val = u8::column_result(value)?;
        match int_val {
            0 => Ok(JobStatus::Pending),
            1 => Ok(JobStatus::Running),
            2 => Ok(JobStatus::Done),
            3 => Ok(JobStatus::Failed),
            4 => Ok(JobStatus::Cancelled),
            other => Err(FromSqlError::OutOfRange(other as i64)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum JobPayload {
    Waveform { track_id: i64 },
}

impl JobPayload {
    pub fn kind(&self) -> JobKind {
        match self {
            Self::Waveform { .. } => JobKind::Waveform,
        }
    }

    pub fn track_id(&self) -> Option<i64> {
        match self {
            Self::Waveform { track_id } => Some(*track_id),
        }
    }
}

impl ToSql for JobPayload {
    fn to_sql(&self) -> rusqlite::Result<ToSqlOutput<'_>> {
        let s = serde_json::to_string(self).map_err(|e| ToSqlConversionFailure(Box::new(e)))?;
        Ok(ToSqlOutput::from(s))
    }
}
impl FromSql for JobPayload {
    fn column_result(value: rusqlite::types::ValueRef<'_>) -> rusqlite::types::FromSqlResult<Self> {
        serde_json::from_str(value.as_str()?).map_err(|e| FromSqlError::Other(Box::new(e)))
    }
}

#[derive(Debug, Clone)]
pub struct Job {
    pub job_id: i64,
    pub job_kind: JobKind,
    pub job_status: JobStatus,

    pub payload: JobPayload,
    pub dedupe_key: Option<String>,

    pub priority: i64,
    pub attempts: i64,
    pub max_attempts: i64,
    pub error: Option<String>,

    pub run_after: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub started_at: Option<DateTime<Utc>>,
    pub finished_at: Option<DateTime<Utc>>,
}

impl Job {
    pub fn row_to_job(row: &Row<'_>) -> rusqlite::Result<Self> {
        Ok(Self {
            job_id: row.get("job_id")?,
            job_kind: row.get("job_kind_id")?,
            job_status: row.get("job_status_id")?,
            payload: row.get("payload")?,
            dedupe_key: row.get("dedupe_key")?,
            priority: row.get("priority")?,
            attempts: row.get("attempts")?,
            max_attempts: row.get("max_attempts")?,
            error: row.get("error")?,
            run_after: row.get("run_after")?,
            created_at: row.get("created_at")?,
            started_at: row.get("started_at")?,
            finished_at: row.get("finished_at")?,
        })
    }
}

#[derive(Debug, Clone)]
pub struct NewJob {
    pub job_kind: JobKind,
    pub job_status: JobStatus,

    pub payload: JobPayload,
    pub dedupe_key: Option<String>,

    pub priority: i64,
    pub attempts: i64,
    pub max_attempts: i64,

    pub run_after: Option<DateTime<Utc>>,
}

impl NewJob {
    pub fn waveform(track_id: i64) -> Self {
        Self {
            job_kind: JobKind::Waveform,
            job_status: JobStatus::Pending,
            payload: JobPayload::Waveform { track_id },
            dedupe_key: Some(format!("track:{track_id}")),
            priority: 0,
            attempts: 0,
            max_attempts: 3,
            run_after: None,
        }
    }
}

#[derive(Debug, Clone, Default)]
pub struct UpdateJob {
    pub job_status: Option<JobStatus>,
    pub attempts: Option<i64>,
    pub error: Option<Option<String>>,
    pub run_after: Option<DateTime<Utc>>,
    pub started_at: Option<Option<DateTime<Utc>>>,
    pub finished_at: Option<Option<DateTime<Utc>>>,
}
