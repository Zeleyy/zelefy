use serde::Serialize;

use crate::models::jobs::{JobKind, JobStatus};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JobEvent {
    pub job_id: i64,
    pub kind: JobKind,
    pub track_id: Option<i64>,
    pub status: JobStatus,
    pub error: Option<String>,
}
