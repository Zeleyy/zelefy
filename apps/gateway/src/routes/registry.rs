use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
pub struct RouteEntry {
    pub upstream_base: String,
    pub requires_auth: bool,
}

#[derive(Debug, Default)]
pub struct RouteRegistry {
    routes: HashMap<String, RouteEntry>,
}

impl RouteRegistry {
    pub fn find(&self, path: &str) -> Option<&RouteEntry> {
        self.routes.get(path).or_else(|| self.find_templated(path))
    }

    fn find_templated(&self, path: &str) -> Option<&RouteEntry> {
        let path_segments: Vec<&str> = path.split('/').collect();
        self.routes.iter().find_map(|(template, entry)| {
            let template_segments: Vec<&str> = template.split('/').collect();
            if template_segments.len() != path_segments.len() {
                return None;
            }
            let matches = template_segments
                .iter()
                .zip(&path_segments)
                .all(|(t, p)| t.starts_with('{') && t.ends_with('}') || t == p);
            matches.then_some(entry)
        })
    }

    pub fn replace_for_service(&mut self, service_base: &str, entries: Vec<(String, RouteEntry)>) {
        self.routes.retain(|_, v| v.upstream_base != service_base);
        self.routes.extend(entries);
    }

    pub fn all(&self) -> Vec<(String, RouteEntry)> {
        self.routes
            .iter()
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect()
    }
}

pub type SharedRegistry = Arc<RwLock<RouteRegistry>>;
