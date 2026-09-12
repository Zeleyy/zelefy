use aws_sdk_s3::{Client, config::{Builder, Credentials, Region}};

pub fn create_s3_client(
    endpoint_url: impl Into<String>,
    access_key_id: impl Into<String>,
    secret_access_key: impl Into<String>,
    region: impl Into<String>,
) -> Client {
    let credentials = Credentials::new(
        access_key_id,
        secret_access_key,
        None,
        None,
        "Static"
    );

    let config = Builder::new()
        .region(Region::new(region.into()))
        .endpoint_url(endpoint_url)
        .credentials_provider(credentials)
        .force_path_style(true)
        .build();

    Client::from_conf(config)
}
