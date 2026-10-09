#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StorageType {
    Cache = 0,
    Library = 1,
}

#[derive(Debug, Clone)]
pub struct Storage {
    pub storage_id: i64,
    pub path: String,
    pub storage_type: StorageType,
    pub is_primary: bool,
    pub max_size_bytes: Option<i64>,
    pub created_at: i64,
}
