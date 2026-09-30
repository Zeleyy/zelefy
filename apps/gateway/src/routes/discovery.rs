use axum::body::Body;
use hyper::{Request, Uri};
use serde::Deserialize;

use crate::HttpClient;

use super::registry::{RouteEntry, SharedRegistry};

#[derive(Deserialize)]
struct OpenApiDoc {
    paths: std::collections::HashMap<String, std::collections::HashMap<String, PathItem>>,
}

#[derive(Deserialize)]
struct PathItem {
    #[serde(default)]
    security: Option<Vec<serde_json::Value>>,
}

pub async fn discover_service(
    http_client: &HttpClient,
    registry: &SharedRegistry,
    service_name: &str,
    service_url: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let uri: Uri = format!("{service_url}/api-docs/openapi.json").parse()?;
    let req = Request::builder().uri(uri).body(Body::empty())?;
    let resp = http_client.request(req).await?;
    let bytes = http_body_util::BodyExt::collect(resp.into_body())
        .await?
        .to_bytes();
    let doc: OpenApiDoc = serde_json::from_slice(&bytes)?;

    let mut entries: Vec<(String, RouteEntry)> = doc
        .paths
        .into_iter()
        .map(|(path, methods)| {
            let requires_auth = methods.values().any(|m| {
                m.security
                    .as_ref()
                    .map(|sec| !sec.is_empty())
                    .unwrap_or(false)
            });

            let full_path = if path.starts_with("/api/v1") {
                path
            } else {
                format!("/api/v1{}", path)
            };

            (
                full_path,
                RouteEntry {
                    upstream_base: service_url.to_string(),
                    requires_auth,
                },
            )
        })
        .collect();

    entries.push((
        format!("/api-docs/{}/openapi.json", service_name),
        RouteEntry {
            upstream_base: service_url.to_string(),
            requires_auth: false,
        },
    ));

    let mut reg = registry.write().await;
    reg.replace_for_service(service_url, entries);

    tracing::info!("Discovered {} routes from {}", service_name, service_url);
    Ok(())
}

pub async fn discover_all(
    http_client: &HttpClient,
    registry: SharedRegistry,
    config: &crate::config::Config,
) {
    let services = [
        ("auth", config.auth_url.as_str()),
        ("profiles", config.profiles_url.as_str()),
    ];

    for (name, url) in services {
        if let Err(err) = discover_service(http_client, &registry, name, url).await {
            tracing::warn!("Failed to discover routes from {}: {:?}", name, err);
        }
    }
}
