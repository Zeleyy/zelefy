use std::path::{Component, Path, PathBuf};

pub const DATA_DIR: &str = "zelefy-data";

/// Приводит выбранный пользователем путь к
/// `.../zelefy-data/<kind>/`
pub fn resolve_data_root(chosen: &Path, kind: &str) -> PathBuf {
    let mut root = PathBuf::new();

    for comp in chosen.components() {
        root.push(comp);
        if matches!(comp, Component::Normal(name) if name.eq_ignore_ascii_case(DATA_DIR)) {
            return root.join(kind);
        }
    }

    root.push(DATA_DIR);
    root.push(kind);
    root
}
