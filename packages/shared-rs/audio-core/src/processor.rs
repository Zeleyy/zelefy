use crate::decoder::Waveform;

pub fn normalize(wave: &mut Waveform) {
    let max = wave.peaks.iter().cloned().fold(0.0f32, f32::max);
    if max > 0.0 {
        for p in &mut wave.peaks {
            *p /= max;
        }
    }
}

pub fn resample(peaks: &[f32], target: usize) -> Vec<f32> {
    if peaks.is_empty() || target == 0 {
        return Vec::new();
    }
    let target = target.min(peaks.len());
    let chunk = peaks.len().div_ceil(target);
    peaks
        .chunks(chunk)
        .map(|c| c.iter().sum::<f32>() / c.len() as f32)
        .collect()
}

pub fn to_i16(peaks: &[f32]) -> Vec<i16> {
    peaks
        .iter()
        .map(|&p| (p.clamp(0.0, 1.0) * i16::MAX as f32) as i16)
        .collect()
}

pub fn to_bin_bytes(peaks: &[f32]) -> Vec<u8> {
    let i16s = to_i16(peaks);
    let mut out = Vec::with_capacity(i16s.len() * 2);
    for v in i16s {
        out.extend_from_slice(&v.to_le_bytes());
    }
    out
}
