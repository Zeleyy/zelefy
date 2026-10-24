use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Library {
    pub library_id: i64,
    pub path: String,
    pub is_primary: bool,
    pub created_at: i64,
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
