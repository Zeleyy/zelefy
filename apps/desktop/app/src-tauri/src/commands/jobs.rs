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
    let limit = limit.unwrap_or(50).clamp(1, 200);
    let fetch = limit.saturating_add(1);

    let conn = db.lock();

    let mut jobs = repository::jobs::get_page(&conn, after, fetch).map_err(|e| e.to_string())?;

    let has_more = jobs.len() > limit as usize;
    jobs.truncate(limit as usize);

    let next_cursor = if has_more {
        jobs.last().map(|j| JobCursor { job_id: j.job_id })
    } else {
        None
    };

    Ok(JobsPage {
        items: jobs.iter().map(JobEvent::from).collect(),
        next_cursor,
    })
}

#[tauri::command]
pub fn get_active_jobs(db: State<'_, DbState>) -> Result<Vec<JobEvent>, String> {
    let conn = db.lock();
    let jobs = repository::jobs::get_active(&conn).map_err(|e| e.to_string())?;
    Ok(jobs.iter().map(JobEvent::from).collect())
}
