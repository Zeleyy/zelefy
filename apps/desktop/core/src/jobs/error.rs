#[derive(Debug)]
pub enum JobError {
    TrackGone,
    Failed(String),
}

impl std::fmt::Display for JobError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::TrackGone => write!(f, "track no longer exists"),
            Self::Failed(m) => write!(f, "{m}"),
        }
    }
}

impl<E: std::error::Error> From<E> for JobError {
    fn from(e: E) -> Self {
        Self::Failed(e.to_string())
    }
}
