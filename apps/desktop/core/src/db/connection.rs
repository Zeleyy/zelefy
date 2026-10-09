use include_dir::{Dir, include_dir};
use rusqlite::Connection;
use rusqlite_migration::Migrations;

static MIGRATIONS_DIR: Dir<'static> = include_dir!("$CARGO_MANIFEST_DIR/migrations");

pub fn create(database_path: &str) -> Result<Connection, rusqlite::Error> {
    let conn = Connection::open(database_path)?;

    conn.pragma_update(None, "foreign_keys", "ON")?;
    conn.pragma_update(None, "journal_mode", "WAL")?;
    conn.pragma_update(None, "synchronous", "NORMAL")?;

    conn.busy_timeout(std::time::Duration::from_secs(5))?;

    Ok(conn)
}

pub fn init_db(database_path: &str) -> Result<Connection, Box<dyn std::error::Error>> {
    let mut conn = create(database_path)?;

    let migrations = Migrations::from_directory(&MIGRATIONS_DIR)
        .map_err(|e| format!("Failed to parse migrations directory: {e}"))?;

    migrations
        .to_latest(&mut conn)
        .map_err(|e| format!("Failed to run database migrations: {e}"))?;

    Ok(conn)
}
