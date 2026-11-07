use std::{
    fs, io,
    path::{Path, PathBuf},
};

pub fn copy_file(src: &Path, dest: &Path) -> io::Result<i64> {
    if let Some(dir) = dest.parent() {
        fs::create_dir_all(dir)?;
    }
    let size = fs::copy(src, dest).inspect_err(|_| {
        let _ = fs::remove_file(dest);
    })?;
    Ok(size as i64)
}

pub fn create_file_with_data(src: &Path, data: &[u8]) -> io::Result<()> {
    if let Some(dir) = src.parent() {
        fs::create_dir_all(dir)?;
    }
    fs::write(src, data)?;
    Ok(())
}

#[derive(Default)]
pub struct Written(Vec<PathBuf>);

impl Written {
    pub fn file(&mut self, p: PathBuf) {
        self.0.push(p);
    }
    pub fn keep(mut self) {
        self.0.clear();
    }
}

impl Drop for Written {
    fn drop(&mut self) {
        for p in &self.0 {
            let _ = fs::remove_file(p);
        }
    }
}
