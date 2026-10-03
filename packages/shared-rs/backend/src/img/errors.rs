use std::io;

use image::ImageError;
use webp_rust::EncoderError;

#[derive(thiserror::Error, Debug)]
pub enum ConvertError {
    #[error("I/O error: {0}")]
    Io(#[from] io::Error),

    #[error("Image processing error: {0}")]
    Image(#[from] ImageError),

    #[error("WebP encoding error: {0}")]
    WebP(#[from] EncoderError),
}
