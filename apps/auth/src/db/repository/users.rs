use uuid::Uuid;

use crate::models::users::User;
use zelefy_common::{SubscriptionTier, UserRole};


pub async fn get_by_id<'e, E>(
    executor: E,
    user_id: Uuid,
) -> Result<Option<User>, sqlx::Error>
where
    E: sqlx::PgExecutor<'e>,
{
    sqlx::query_as!(
        User,
        r#"
            SELECT
                user_id,
                email,
                password_hash,
                subscription AS "subscription: SubscriptionTier",
                role AS "role: UserRole",
                is_blocked,
                created_at,
                updated_at
            FROM users
            WHERE user_id = $1
        "#,
        user_id
    )
    .fetch_optional(executor)
    .await
}


pub async fn get_by_email<'e, E>(
    executor: E,
    email: &str,
) -> Result<Option<User>, sqlx::Error>
where
    E: sqlx::PgExecutor<'e>,
{
    sqlx::query_as!(
        User,
        r#"
            SELECT
                user_id,
                email,
                password_hash,
                subscription AS "subscription: SubscriptionTier",
                role AS "role: UserRole",
                is_blocked,
                created_at,
                updated_at
            FROM users
            WHERE users.email = $1
        "#,
        email
    )
    .fetch_optional(executor)
    .await
}

pub async fn create<'e, E>(
    executor: E,
    email: &str,
    password_hash: &str,
) -> Result<User, sqlx::Error>
where
    E: sqlx::PgExecutor<'e>,
{
    sqlx::query_as!(
        User,
        r#"
            INSERT INTO users (email, password_hash)
            VALUES ($1, $2)
            RETURNING user_id, email, password_hash, subscription AS "subscription: SubscriptionTier", role AS "role: UserRole", is_blocked, created_at, updated_at
        "#,
        email,
        password_hash
    )
    .fetch_one(executor)
    .await
}


#[derive(Debug, Default)]
pub struct UpdateUserParams<'a> {
    pub email: Option<&'a str>,
    pub password_hash: Option<&'a str>,
    pub subscription: Option<SubscriptionTier>,
    pub role: Option<UserRole>,
    pub is_blocked: Option<bool>,
}

pub async fn update<'e, E>(
    executor: E,
    user_id: Uuid,
    params: UpdateUserParams<'_>,
) -> Result<User, sqlx::Error>
where
    E: sqlx::PgExecutor<'e>,
{
    sqlx::query_as!(
        User,
        r#"
            UPDATE users
            SET
                email = COALESCE($1, email),
                password_hash = COALESCE($2, password_hash),
                subscription = COALESCE($3, subscription),
                role = COALESCE($4, role),
                is_blocked = COALESCE($5, is_blocked)
            WHERE user_id = $6
            RETURNING 
                user_id, 
                email, 
                password_hash, 
                subscription AS "subscription: SubscriptionTier", 
                role AS "role: UserRole", 
                is_blocked, 
                created_at, 
                updated_at
        "#,
        params.email,
        params.password_hash,
        params.subscription as Option<SubscriptionTier>,
        params.role as Option<UserRole>,
        params.is_blocked,
        user_id
    )
    .fetch_one(executor)
    .await
}
