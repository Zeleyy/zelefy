pub struct NewLocalFile {
    pub library_id: Option<i64>,
    pub file_path: String,
    pub is_link: bool,
    pub file_hash: Option<String>,
    pub file_size_bytes: i64,
}
