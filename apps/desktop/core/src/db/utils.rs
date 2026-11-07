use rusqlite::types::Value;

pub fn push_opt_nullable<T>(
    set_parts: &mut Vec<String>,
    values: &mut Vec<Value>,
    column: &str,
    value: Option<Option<T>>,
) where
    T: Into<Value>,
{
    match value {
        None => {}
        Some(None) => {
            set_parts.push(format!("{column} = ?"));
            values.push(Value::Null);
        }
        Some(Some(v)) => {
            set_parts.push(format!("{column} = ?"));
            values.push(v.into());
        }
    }
}
