use desktop_core::{
    db::{repository, DbState},
    models::jobs::{JobCursor, JobEvent, JobsPage},
};
use tauri::State;

#[tauri::command]
pub fn get_jobs_page(
    db: State<'_, DbState>,
    after: Option<JobCursor>,
    limit: Option<u32>,
) -> Result<JobsPage, String> {
    let (limit, fetch) = JobsPage::resolve_limits(limit, 50, 200);

    let conn = db.lock();

    let jobs = repository::jobs::get_page(&conn, after, fetch).map_err(|e| e.to_string())?;

    Ok(JobsPage::from_fetched(
        jobs.iter().map(JobEvent::from).collect(),
        limit,
        |j| JobCursor { job_id: j.job_id },
    ))
}

#[tauri::command]
pub fn get_active_jobs(db: State<'_, DbState>) -> Result<Vec<JobEvent>, String> {
    let conn = db.lock();
    let jobs = repository::jobs::get_active(&conn).map_err(|e| e.to_string())?;
    Ok(jobs.iter().map(JobEvent::from).collect())
}
