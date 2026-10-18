use bytes::Bytes;
use std::io::{self, Read, Seek, SeekFrom};
use symphonia::{
    core::{
        audio::GenericAudioBufferRef,
        codecs::{CodecParameters, audio::AudioDecoderOptions},
        errors::Error as SymphoniaError,
        formats::{FormatOptions, probe::Hint},
        io::{MediaSource, MediaSourceStream},
        meta::MetadataOptions,
    },
    default::{get_codecs, get_probe},
};

use crate::errors::AudioError;

pub struct Waveform {
    pub peaks: Vec<f32>,
    pub sample_rate: u32,
    pub duration_secs: f32,
}

#[derive(Debug, Clone, Copy)]
pub enum WaveformMode {
    Peak,
    Rms,
}

#[derive(Debug, Clone, Copy)]
pub struct WaveformOptions {
    pub points: usize,
    pub window_ms: u32,
    pub mode: WaveformMode,
}

impl Default for WaveformOptions {
    fn default() -> Self {
        Self {
            points: 1500,
            window_ms: 1,
            mode: WaveformMode::Peak,
        }
    }
}

pub fn decode_waveform<S>(stream: S, opts: WaveformOptions) -> Result<Waveform, AudioError>
where
    S: Read + Seek + MediaSource + Send + 'static,
{
    let mss = MediaSourceStream::new(Box::new(stream), Default::default());
    let mut format = get_probe().probe(
        &Hint::new(),
        mss,
        FormatOptions::default(),
        MetadataOptions::default(),
    )?;

    let track = format
        .tracks()
        .iter()
        .find(|t| t.codec_params.is_some())
        .ok_or(AudioError::NoAudioTrack)?;

    let track_id = track.id;

    let codec_params = track
        .codec_params
        .as_ref()
        .ok_or(AudioError::NoAudioTrack)?;

    let audio_params = match codec_params {
        CodecParameters::Audio(params) => params,
        _ => return Err(AudioError::NoAudioTrack),
    };

    let sample_rate = audio_params.sample_rate.unwrap_or(44100);
    let mut decoder =
        get_codecs().make_audio_decoder(audio_params, &AudioDecoderOptions::default())?;

    let window = ((sample_rate as u64 * opts.window_ms as u64) / 1000).max(1) as usize;

    let mut peaks: Vec<f32> = Vec::new();
    let mut scratch: Vec<f32> = Vec::new();
    let mut mono: Vec<f32> = Vec::new();
    let mut carry: Vec<f32> = Vec::new();
    let mut total_samples: u64 = 0;

    loop {
        let packet = match format.next_packet() {
            Ok(Some(packet)) => packet,
            Ok(None) => break,
            Err(SymphoniaError::IoError(e)) if e.kind() == std::io::ErrorKind::UnexpectedEof => {
                break;
            }
            Err(err) => return Err(err.into()),
        };

        if packet.track_id != track_id {
            continue;
        }

        match decoder.decode(&packet) {
            Ok(decoded) => {
                mono.clear();
                downmix_to_mono(&decoded, &mut scratch, &mut mono);
                total_samples += mono.len() as u64;
                accumulate(&mono, &mut carry, window, opts.mode, &mut peaks);
            }
            Err(SymphoniaError::DecodeError(_)) => {
                continue;
            }
            Err(err) => return Err(err.into()),
        }
    }

    if !carry.is_empty() {
        peaks.push(window_aggregate(&carry, opts.mode));
    }

    let duration_secs = total_samples as f32 / sample_rate as f32;

    Ok(Waveform {
        peaks: compress_peaks(&peaks, opts.points),
        sample_rate,
        duration_secs,
    })
}

fn downmix_to_mono(
    decoded: &GenericAudioBufferRef<'_>,
    interleaved: &mut Vec<f32>,
    mono: &mut Vec<f32>,
) {
    let channels = decoded.spec().channels().count();
    interleaved.clear();
    decoded.copy_to_vec_interleaved::<f32>(interleaved);

    if channels == 0 {
        return;
    }
    for frame in interleaved.chunks(channels) {
        let sum: f32 = frame.iter().sum();
        mono.push(sum / channels as f32);
    }
}

fn accumulate(
    mono: &[f32],
    carry: &mut Vec<f32>,
    window: usize,
    mode: WaveformMode,
    out: &mut Vec<f32>,
) {
    let mut i = 0;

    if !carry.is_empty() {
        let need = window - carry.len();
        let take = need.min(mono.len());
        carry.extend_from_slice(&mono[..take]);
        i += take;
        if carry.len() == window {
            out.push(window_aggregate(carry, mode));
            carry.clear();
        }
    }

    while i + window <= mono.len() {
        out.push(window_aggregate(&mono[i..i + window], mode));
        i += window;
    }

    carry.extend_from_slice(&mono[i..]);
}

fn window_aggregate(samples: &[f32], mode: WaveformMode) -> f32 {
    match mode {
        WaveformMode::Peak => samples.iter().fold(0.0f32, |m, &s| m.max(s.abs())),
        WaveformMode::Rms => {
            let sum_sq: f32 = samples.iter().map(|&s| s * s).sum();
            (sum_sq / samples.len() as f32).sqrt()
        }
    }
}

fn compress_peaks(peaks: &[f32], points: usize) -> Vec<f32> {
    if peaks.is_empty() || points == 0 {
        return Vec::new();
    }
    let points = points.min(peaks.len());
    let chunk = peaks.len().div_ceil(points);

    let mut out = Vec::with_capacity(points);
    for c in peaks.chunks(chunk) {
        out.push(c.iter().fold(0.0f32, |m, &s| m.max(s)));
    }
    out
}

struct BytesMediaSource {
    cursor: io::Cursor<Bytes>,
}

impl BytesMediaSource {
    fn new(bytes: Bytes) -> Self {
        Self {
            cursor: io::Cursor::new(bytes),
        }
    }
}

impl Read for BytesMediaSource {
    fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
        self.cursor.read(buf)
    }
}

impl Seek for BytesMediaSource {
    fn seek(&mut self, pos: SeekFrom) -> io::Result<u64> {
        self.cursor.seek(pos)
    }
}

impl MediaSource for BytesMediaSource {
    fn is_seekable(&self) -> bool {
        true
    }
    fn byte_len(&self) -> Option<u64> {
        Some(self.cursor.get_ref().len() as u64)
    }
}

pub fn decode_waveform_from_bytes(
    bytes: Bytes,
    opts: WaveformOptions,
) -> Result<Waveform, AudioError> {
    decode_waveform(BytesMediaSource::new(bytes), opts)
}
