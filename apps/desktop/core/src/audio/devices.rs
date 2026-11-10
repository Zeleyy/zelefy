#[cfg(not(target_os = "linux"))]
use rodio::{
    DeviceTrait,
    cpal::{self, DeviceId, traits::HostTrait},
};
use serde::Serialize;
use std::str::FromStr;

use crate::audio::errors::EngineError;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AudioSink {
    pub id: String,
    pub description: String,
    pub is_default: bool,
    pub is_active: bool,
}

pub fn get_list_output_devices(active: Option<DeviceId>) -> Result<Vec<AudioSink>, EngineError> {
    #[cfg(not(target_os = "linux"))]
    {
        get_list_output_devices_cpal(active)
    }
    #[cfg(target_os = "linux")]
    {
        let _ = active;
        Ok(Vec::new()) // TODO: Реализация для Linux
    }
}

#[cfg(not(target_os = "linux"))]
fn get_list_output_devices_cpal(active: Option<DeviceId>) -> Result<Vec<AudioSink>, EngineError> {
    let host = cpal::default_host();
    let default_id = host.default_output_device().and_then(|d| d.id().ok());

    let devices = host.output_devices().map_err(EngineError::AudioDevice)?;

    let mut sinks = Vec::new();
    for device in devices {
        let Ok(id) = device.id() else { continue };

        let description = device
            .description()
            .map(|d| d.name().to_string())
            .unwrap_or_else(|_| id.to_string());

        let is_default = default_id.as_ref() == Some(&id);
        let is_selected = active.as_ref() == Some(&id);
        let is_active = is_selected || (active.is_none() && is_default);

        sinks.push(AudioSink {
            id: id.to_string(),
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

pub fn resolve_device_id(device_id: Option<String>) -> Result<Option<DeviceId>, EngineError> {
    #[cfg(not(target_os = "linux"))]
    {
        let Some(s) = device_id else {
            return Ok(None);
        };

        let id = DeviceId::from_str(&s).map_err(|e| EngineError::InvalidDeviceId(e.to_string()))?;

        if cpal::default_host().device_by_id(&id).is_none() {
            return Err(EngineError::DeviceNotFound(id.to_string()));
        }

        Ok(Some(id))
    }
    #[cfg(target_os = "linux")]
    {
        let _ = device_id;
        Ok(None) // TODO: Реализация для Linux
    }
}
