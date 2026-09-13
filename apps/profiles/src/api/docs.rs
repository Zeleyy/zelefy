use utoipa::{OpenApi};
use super::v1::profiles;

#[derive(OpenApi)]
#[openapi(
    paths(
        profiles::get_by_permalink
    ),
)]
pub struct ApiDoc;
