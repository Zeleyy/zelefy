use rusqlite::types::{FromSql, FromSqlError, FromSqlResult, ValueRef};
use serde::{Deserialize, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};

#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize_repr, Deserialize_repr)]
pub enum StorageType {
    Cache = 0,
    Library = 1,
}

impl FromSql for StorageType {
    fn column_result(value: ValueRef<'_>) -> FromSqlResult<Self> {
        let v = value.as_i64()?;
        match v {
            0 => Ok(StorageType::Cache),
            1 => Ok(StorageType::Library),
            _ => Err(FromSqlError::OutOfRange(v)),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Storage {
    pub storage_id: i64,
    pub path: String,
    pub storage_type: StorageType,
    pub is_primary: bool,
    pub max_size_bytes: Option<i64>,
    pub created_at: i64,
}

#[derive(Deserialize)]
pub struct NewStorage {
    pub path: String,
    pub storage_type: StorageType,
    pub is_primary: bool,
    pub max_size_bytes: Option<i64>,
}

pub struct UpdateStorage {
    pub path: Option<String>,
    pub is_primary: Option<bool>,
    pub max_size_bytes: Option<Option<i64>>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageWithStats {
    #[serde(flatten)]
    pub storage: Storage,
    pub used_size_bytes: i64,
    pub files_count: i64,
}
