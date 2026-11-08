use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CursorPage<T, C> {
    pub items: Vec<T>,
    pub next_cursor: Option<C>,
}
