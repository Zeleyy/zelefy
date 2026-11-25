use rusqlite::{
    ToSql,
    types::{FromSql, FromSqlError, ToSqlOutput},
};
use serde::{Deserialize, Serialize};

use crate::models::utils::TimestampMs;

#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FileType {
    Audio = 0,
    Image = 1,
    Waveform = 2,
}

impl ToSql for FileType {
    fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
        Ok(ToSqlOutput::from(*self as u8))
    }
}

impl FromSql for FileType {
    fn column_result(value: rusqlite::types::ValueRef<'_>) -> rusqlite::types::FromSqlResult<Self> {
        let int_val = u8::column_result(value)?;
        match int_val {
            0 => Ok(FileType::Audio),
            1 => Ok(FileType::Image),
            2 => Ok(FileType::Waveform),
            other => Err(FromSqlError::OutOfRange(other as i64)),
        }
    }
}

#[derive(Debug, Clone)]
pub struct File {
    pub file_id: i64,
    pub file_type: FileType,

    pub library_id: Option<i64>,
    pub path: String,
    pub is_link: bool,
    pub size_bytes: i64,
    pub hash: Option<String>,

    pub last_accessed_at: TimestampMs,
    pub created_at: TimestampMs,
}

#[derive(Debug, Clone)]
pub struct NewFile {
    pub file_type: FileType,

    pub library_id: Option<i64>,
    pub path: String,
    pub is_link: bool,
    pub size_bytes: i64,
    pub hash: Option<String>,
}

#[derive(Debug, Default)]
pub struct UpdateFile {
    pub library_id: Option<Option<i64>>,
    pub path: Option<String>,
    pub size_bytes: Option<i64>,
    pub hash: Option<Option<String>>,
}
