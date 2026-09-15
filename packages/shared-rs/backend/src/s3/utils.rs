use uuid::Uuid;

pub fn build_key(folder: &str, resource_id: Uuid, file_ext: &str) -> String {
    let file_uuid = Uuid::new_v4();
    format!(
        "{}/{}/{}.{}",
        folder.trim_matches('/'),
        resource_id,
        file_uuid,
        file_ext
    )
}

pub fn extract_key_from_url(folder: &str, url: &str) -> Option<String> {
    let prefix = format!("{}/", folder.trim_matches('/'));
    url.find(&prefix).map(|index| url[index..].to_string())
}
