use sqlx::{Postgres, query_builder::Separated};

pub fn push_opt_nullable<'a, T>(
    sep: &mut Separated<'a, Postgres, &'a str>,
    column: &str,
    value: Option<Option<T>>,
) where
    T: sqlx::Encode<'a, Postgres> + sqlx::Type<Postgres> + 'a,
{
    match value {
        None => {}
        Some(None) => {
            sep.push(column).push_unseparated(" = NULL");
        }
        Some(Some(v)) => {
            sep.push(column).push_unseparated(" = ").push_bind_unseparated(v);
        }
    }
}
