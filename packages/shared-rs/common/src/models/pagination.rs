use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CursorPage<T, C> {
    pub items: Vec<T>,
    pub next_cursor: Option<C>,
}

impl<T, C> CursorPage<T, C> {
    pub fn resolve_limits(limit: Option<u32>, default: u32, max: u32) -> (usize, u32) {
        let limit = limit.unwrap_or(default).clamp(1, max);
        let fetch = limit.saturating_add(1);
        (limit as usize, fetch)
    }

    pub fn from_fetched<F>(mut items: Vec<T>, limit: usize, make_cursor: F) -> Self
    where
        F: FnOnce(&T) -> C,
    {
        let has_more = items.len() > limit;
        items.truncate(limit);

        let next_cursor = if has_more {
            items.last().map(make_cursor)
        } else {
            None
        };

        Self { items, next_cursor }
    }
}
