use rusqlite::Connection;
use zelefy_common::profiles::ProfileDetails;

pub async fn get_and_cache(
    conn: &Connection,
) -> Result<ProfileDetails, Box<dyn std::error::Error>> {
}
