use std::{
    panic::{AssertUnwindSafe, catch_unwind},
    sync::mpsc,
    thread,
    time::Duration,
};

use crate::{
    db::{DbState, repository},
    jobs::{JobError, JobEvent, handlers},
    models::jobs::{Job, JobStatus},
};

#[derive(Clone)]
pub struct JobsHandle {
    tx: mpsc::Sender<()>,
}

impl JobsHandle {
    pub fn wake(&self) {
        let _ = self.tx.send(());
    }
}

pub fn spawn_worker(db: DbState, emit: impl Fn(JobEvent) + Send + 'static) -> JobsHandle {
    let (tx, rx) = mpsc::channel();
    thread::Builder::new()
        .name("jobs-worker".into())
        .spawn(move || run(db, rx, emit))
        .expect("spawn jobs worker");
    JobsHandle { tx }
}

fn run(db: DbState, rx: mpsc::Receiver<()>, emit: impl Fn(JobEvent)) {
    if let Err(e) = repository::jobs::recover_running(&db.lock()) {
        eprintln!("recover_running: {e}");
    }

    loop {
        let claimed = repository::jobs::claim_next(&db.lock());
        match claimed {
            Ok(Some(job)) => process(&db, &emit, job),
            Ok(None) => match rx.recv_timeout(Duration::from_secs(30)) {
                Ok(()) | Err(mpsc::RecvTimeoutError::Timeout) => while rx.try_recv().is_ok() {},
                Err(mpsc::RecvTimeoutError::Disconnected) => return,
            },
            Err(e) => {
                eprintln!("claim_next: {e}");
                thread::sleep(Duration::from_secs(5));
            }
        }
    }
}

fn process(db: &DbState, emit: &impl Fn(JobEvent), job: Job) {
    let (job_id, kind) = (job.job_id, job.job_kind);
    let track_id = job.payload.track_id();
    let ev = |status, error| JobEvent {
        job_id,
        kind,
        track_id,
        status,
        error,
    };

    emit(ev(JobStatus::Running, None));

    let outcome = catch_unwind(AssertUnwindSafe(|| handlers::run(db, &job.payload)))
        .unwrap_or_else(|_| Err(JobError::Failed("job panicked".into())));

    let (status, error) = {
        let conn = db.lock();
        match outcome {
            Ok(()) => {
                let _ = repository::jobs::complete(&conn, job_id);
                (JobStatus::Done, None)
            }
            Err(JobError::TrackGone) => {
                let _ = repository::jobs::cancel(&conn, job_id);
                (JobStatus::Cancelled, None)
            }
            Err(e) => {
                let msg = e.to_string();
                let _ = repository::jobs::fail(&conn, job_id, msg.clone());
                let st = repository::jobs::get_by_id(&conn, job_id)
                    .ok()
                    .flatten()
                    .map(|j| j.job_status)
                    .unwrap_or(JobStatus::Failed);
                (st, Some(msg))
            }
        }
    };
    emit(ev(status, error));
}
