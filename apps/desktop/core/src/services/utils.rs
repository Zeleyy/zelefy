use rusqlite::{Error::SqliteFailure, ErrorCode::ConstraintViolation};

pub fn is_unique_violation_on_path(err: &rusqlite::Error) -> bool {
    match err {
        SqliteFailure(e, Some(msg)) => {
            e.code == ConstraintViolation && msg.contains("UNIQUE constraint failed: storages.path")
        }
        _ => false,
    }
}

pub fn slugify(s: &str) -> String {
    let mut out = String::new();
    let mut last_dash = false;
    for c in s.chars() {
        if c.is_alphanumeric() {
            out.extend(c.to_lowercase());
            last_dash = false;
        } else if !last_dash && !out.is_empty() {
            out.push('-');
            last_dash = true;
        }
    }
    let out = out.trim_end_matches('-').to_string();
    if out.is_empty() { "track".into() } else { out }
}
