use chrono::{DateTime, Utc};
use rusqlite::{
    Row, ToSql,
    types::{FromSql, FromSqlError, ToSqlOutput},
};
use uuid::Uuid;

#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TrackStatus {
    Processing = 0,
    Ready = 1,
    Failed = 2,
    Published = 3,
}

impl ToSql for TrackStatus {
    fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
        Ok(ToSqlOutput::from(*self as u8))
    }
}

impl FromSql for TrackStatus {
    fn column_result(value: rusqlite::types::ValueRef<'_>) -> rusqlite::types::FromSqlResult<Self> {
        let int_val = u8::column_result(value)?;
        match int_val {
            0 => Ok(TrackStatus::Processing),
            1 => Ok(TrackStatus::Ready),
            2 => Ok(TrackStatus::Failed),
            3 => Ok(TrackStatus::Published),
            other => Err(FromSqlError::OutOfRange(other as i64)),
        }
    }
}

pub struct LocalTrack {
    pub track_id: i64,
    pub file_id: Option<i64>,

    pub remote_track_id: Option<Uuid>,
    pub profile_id: Option<i64>,

    pub title: String,
    pub permalink: String,
    pub audio_url: Option<String>,
    pub cover_url: Option<String>,
    pub waveform_url: Option<String>,
    pub duration_seconds: Option<i64>,

    pub genre: Option<String>,
    pub description: Option<String>,
    pub bpm: Option<i32>,
    pub key_signature: Option<String>,
    pub is_private: bool,

    pub status_id: Option<TrackStatus>,
    pub processing_error: Option<String>,

    pub plays_count: i64,
    pub likes_count: i32,
    pub reposts_count: i32,
    pub comments_count: i32,

    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl LocalTrack {
    pub fn row_to_track(row: &Row<'_>) -> rusqlite::Result<LocalTrack> {
        let created_at_ts: i64 = row.get("created_at")?;
        let created_at = DateTime::from_timestamp(created_at_ts, 0).unwrap_or_else(|| Utc::now());

        let updated_at = row
            .get::<_, Option<i64>>("updated_at")?
            .and_then(|ts| DateTime::from_timestamp(ts, 0));

        Ok(Self {
            track_id: row.get("track_id")?,
            file_id: row.get("file_id")?,
            remote_track_id: row.get("remote_track_id")?,
            profile_id: row.get("profile_id")?,
            title: row.get("title")?,
            permalink: row.get("permalink")?,
            audio_url: row.get("audio_url")?,
            cover_url: row.get("cover_url")?,
            waveform_url: row.get("waveform_url")?,
            duration_seconds: row.get("duration_seconds")?,
            genre: row.get("genre")?,
            description: row.get("description")?,
            bpm: row.get("bpm")?,
            key_signature: row.get("key_signature")?,
            is_private: row.get("is_private")?,
            status_id: row.get("status_id")?,
            processing_error: row.get("processing_error")?,
            plays_count: row.get("plays_count")?,
            likes_count: row.get("likes_count")?,
            reposts_count: row.get("reposts_count")?,
            comments_count: row.get("comments_count")?,
            created_at,
            updated_at,
        })
    }
}

pub struct NewLocalTrack {
    pub file_id: i64,
    pub title: String,
    pub permalink: String,
    pub duration_seconds: Option<i64>,
    pub genre: Option<String>,
    pub description: Option<String>,
    pub is_private: bool,
}
