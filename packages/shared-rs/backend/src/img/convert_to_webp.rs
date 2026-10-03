use image::{DynamicImage, ImageReader, imageops::FilterType};
use std::io::Cursor;
use webp_rust::{
    ImageBuffer, LossyEncodingConfig, encoder::encode_lossy_image_to_webp_with_config,
};

use crate::img::ConvertError;

pub fn convert_to_webp(
    input: &[u8],
    target_width: u32,
    target_height: u32,
) -> Result<Vec<u8>, ConvertError> {
    let img = ImageReader::new(Cursor::new(input))
        .with_guessed_format()?
        .decode()?;

    let (src_w, src_h) = (img.width(), img.height());

    let img = if src_w >= target_width && src_h >= target_height {
        img.resize_to_fill(target_width, target_height, FilterType::CatmullRom)
    } else {
        crop_to_aspect(img, target_width, target_height)
    };

    let rgba = img.to_rgba8();

    let webp_buffer = ImageBuffer {
        width: rgba.width() as usize,
        height: rgba.height() as usize,
        rgba: rgba.into_raw(),
    };

    let config = LossyEncodingConfig {
        quality: 75.0,
        method: 4,
        ..Default::default()
    };

    let webp_bytes = encode_lossy_image_to_webp_with_config(&webp_buffer, &config)?;

    Ok(webp_bytes)
}

fn crop_to_aspect(img: DynamicImage, target_width: u32, target_height: u32) -> DynamicImage {
    let (src_w, src_h) = (img.width(), img.height());
    let src_ratio = src_w as f64 / src_h as f64;
    let target_ratio = target_width as f64 / target_height as f64;

    let (crop_w, crop_h) = if src_ratio > target_ratio {
        let crop_w = (src_h as f64 * target_ratio).round() as u32;
        (crop_w, src_h)
    } else {
        let crop_h = (src_w as f64 / target_ratio).round() as u32;
        (src_w, crop_h)
    };

    let x = (src_w - crop_w) / 2;
    let y = (src_h - crop_h) / 2;

    img.crop_imm(x, y, crop_w, crop_h)
}
