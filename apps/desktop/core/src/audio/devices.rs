use rodio::{
    DeviceTrait,
    cpal::{self, traits::HostTrait},
};
use serde::Serialize;

use crate::services::errors::CoreError;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AudioSink {
    pub name: String,
    pub description: String,
    pub is_default: bool,
    pub is_active: bool,
}

pub fn get_list_output_devices(active: Option<&str>) -> Result<Vec<AudioSink>, CoreError> {
    get_list_output_devices_cpal(active)
}

fn get_list_output_devices_cpal(active: Option<&str>) -> Result<Vec<AudioSink>, CoreError> {
    let host = cpal::default_host();

    let default_id = host
        .default_output_device()
        .and_then(|d| d.id().ok())
        .map(|id| id.to_string());

    let devices = host.output_devices().map_err(CoreError::AudioDevice)?;

    let mut sinks = Vec::new();
    for device in devices {
        let Ok(id) = device.id() else { continue };
        let id = id.to_string();

        let description = device
            .description()
            .map(|d| d.name().to_string())
            .unwrap_or_else(|_| id.clone());

        let is_default = default_id.as_deref() == Some(id.as_str());
        let is_active = match active {
            Some(active_id) => active_id == id,
            None => is_default,
        };

        sinks.push(AudioSink {
            name: id,
            description,
            is_default,
            is_active,
        });
    }

    if !sinks.iter().any(|s| s.is_active) {
        if let Some(s) = sinks.iter_mut().find(|s| s.is_default) {
            s.is_active = true;
        }
    }

    Ok(sinks)
}
