mod waveform;

use crate::{db::DbState, jobs::JobError, models::jobs::JobPayload};

pub fn run(db: &DbState, payload: &JobPayload) -> Result<(), JobError> {
    match payload {
        JobPayload::Waveform { track_id } => waveform::run(db, *track_id),
    }
}
