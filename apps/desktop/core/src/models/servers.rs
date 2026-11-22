use rusqlite::Row;
use serde::{Deserialize, Serialize};

use crate::models::utils::TimestampMs;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Server {
    pub server_id: i64,
    pub server_name: String,
    pub server_url: String,
    pub is_active: bool,
    pub created_at: TimestampMs,
}

impl Server {
    pub fn from_row(row: &Row<'_>) -> rusqlite::Result<Self> {
        Ok(Self {
            server_id: row.get("server_id")?,
            server_name: row.get("server_name")?,
            server_url: row.get("server_url")?,
            is_active: row.get("is_active")?,
            created_at: row.get("created_at")?,
        })
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewServer {
    pub server_name: String,
    pub server_url: String,
}
