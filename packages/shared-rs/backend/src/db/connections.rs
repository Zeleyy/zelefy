use sqlx::{PgPool, Postgres, migrate::MigrateDatabase, postgres::PgPoolOptions};
use std::time::Duration;

pub async fn init_pool(
    database_url: &str,
    migrator: Option<&sqlx::migrate::Migrator>,
) -> Result<PgPool, sqlx::Error> {
    if !Postgres::database_exists(database_url)
        .await
        .unwrap_or(false)
    {
        tracing::info!("Database does not exist. Creating...");
        Postgres::create_database(database_url).await?;
        tracing::info!("Database created successfully.");
    }

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .acquire_timeout(Duration::from_secs(3))
        .connect(database_url)
        .await?;

    if let Some(m) = migrator {
        tracing::info!("Running database migrations...");
        m.run(&pool).await?;
        tracing::info!("Migrations applied successfully.");
    }

    Ok(pool)
}
