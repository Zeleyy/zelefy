use std::time::Duration;
use sqlx::{PgPool, Postgres, migrate::MigrateDatabase, postgres::PgPoolOptions};

pub async fn init_pool(database_url: &str) -> Result<PgPool, sqlx::Error> {
    if !Postgres::database_exists(database_url).await.unwrap_or(false) {
        println!("Database does not exist. Creating...");
        Postgres::create_database(database_url).await?;
        println!("Database created successfully.");
    }

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .acquire_timeout(Duration::from_secs(3))
        .connect(database_url)
        .await?;

    println!("Running database migrations...");
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await?;
    println!("Migrations applied successfully.");

    Ok(pool)
}
