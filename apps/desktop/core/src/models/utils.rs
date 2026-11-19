use chrono::{DateTime, TimeDelta, Utc};
use rusqlite::{
    ToSql,
    types::{FromSql, FromSqlError},
};
use serde::{Deserialize, Serialize};
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
