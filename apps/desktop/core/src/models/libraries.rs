use chrono::{DateTime, Utc};
use rusqlite::Row;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Library {
    pub library_id: i64,
    pub path: String,
    pub is_primary: bool,
    pub created_at: DateTime<Utc>,
}

impl Library {
    pub fn row_to_library(row: &Row<'_>, prefix: Option<&str>) -> rusqlite::Result<Self> {
        let p = prefix.unwrap_or("");

        let library_id_col = format!("{}library_id", p);
        let path_col = format!("{}path", p);
        let is_primary_col = format!("{}is_primary", p);
        let created_at_col = format!("{}created_at", p);

        let created_at_ts: i64 = row.get(created_at_col.as_str())?;
        let created_at = DateTime::from_timestamp(created_at_ts, 0).unwrap_or_else(|| Utc::now());

        Ok(Self {
            library_id: row.get(library_id_col.as_str())?,
            path: row.get(path_col.as_str())?,
            is_primary: row.get(is_primary_col.as_str())?,
            created_at,
        })
    }
}

#[derive(Deserialize)]
pub struct NewLibrary {
    pub path: String,
    pub is_primary: bool,
}

#[derive(Debug, Default)]
pub struct UpdateLibrary {
    pub path: Option<String>,
    pub is_primary: Option<bool>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LibraryWithStats {
    #[serde(flatten)]
    pub library: Library,
    pub used_size_bytes: i64,
    pub files_count: i64,
}
