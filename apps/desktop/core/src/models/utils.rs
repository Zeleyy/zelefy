use chrono::{DateTime, TimeDelta, Utc};
use rusqlite::{
    ToSql,
    types::{FromSql, FromSqlError},
};
use serde::{Deserialize, Deserializer, Serialize};
use std::ops::{Add, Deref};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize, Serialize)]
pub struct TimestampMs(pub DateTime<Utc>);

impl TimestampMs {
    pub fn now() -> Self {
        Self(Utc::now())
    }

    pub fn as_millis(&self) -> i64 {
        self.0.timestamp_millis()
    }

    pub fn from_millis(ms: i64) -> Option<Self> {
        DateTime::from_timestamp_millis(ms).map(Self)
    }
}

impl Deref for TimestampMs {
    type Target = DateTime<Utc>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl From<DateTime<Utc>> for TimestampMs {
    fn from(dt: DateTime<Utc>) -> Self {
        Self(dt)
    }
}

impl From<TimestampMs> for DateTime<Utc> {
    fn from(ts: TimestampMs) -> Self {
        ts.0
    }
}

impl Add<TimeDelta> for TimestampMs {
    type Output = Self;

    fn add(self, rhs: TimeDelta) -> Self::Output {
        Self(self.0 + rhs)
    }
}

impl ToSql for TimestampMs {
    fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
        Ok(self.0.timestamp_millis().into())
    }
}

impl FromSql for TimestampMs {
    fn column_result(value: rusqlite::types::ValueRef<'_>) -> rusqlite::types::FromSqlResult<Self> {
        let ms = value.as_i64()?;
        DateTime::from_timestamp_millis(ms)
            .map(TimestampMs)
            .ok_or(FromSqlError::OutOfRange(ms))
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SearchQuery {
    fts: Option<String>,
    short1: Option<String>,
    short2: Option<String>,
}

impl SearchQuery {
    pub fn new(raw: impl AsRef<str>) -> Option<Self> {
        let trimmed = raw.as_ref().trim();
        if trimmed.is_empty() {
            return None;
        }

        let mut fts_terms = Vec::new();
        let mut short_terms = Vec::new();

        for word in trimmed.split_whitespace() {
            if word.chars().count() >= 3 {
                fts_terms.push(Self::escape_fts_phrase(word));
            } else if short_terms.len() < 2 {
                short_terms.push(word.to_lowercase());
            }
        }

        let fts = (!fts_terms.is_empty()).then(|| fts_terms.join(" AND "));
        let mut short_iter = short_terms.into_iter();

        Some(Self {
            fts,
            short1: short_iter.next(),
            short2: short_iter.next(),
        })
    }

    pub fn fts(&self) -> Option<&str> {
        self.fts.as_deref()
    }

    pub fn short1(&self) -> Option<&str> {
        self.short1.as_deref()
    }

    pub fn short2(&self) -> Option<&str> {
        self.short2.as_deref()
    }

    fn escape_fts_phrase(s: &str) -> String {
        format!("\"{}\"", s.replace('"', "\"\""))
    }
}

impl<'de> Deserialize<'de> for SearchQuery {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        SearchQuery::new(&s).ok_or_else(|| serde::de::Error::custom("empty search query"))
    }
}
