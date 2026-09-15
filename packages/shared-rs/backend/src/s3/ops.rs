use aws_sdk_s3::{Client, primitives::ByteStream};
use bytes::Bytes;

pub async fn upload_object(
    client: &Client,
    bucket_name: impl Into<String>,
    key: &str,
    data: Bytes,
    content_type: &str,
) -> Result<String, aws_sdk_s3::Error> {
    client
        .put_object()
        .bucket(bucket_name)
        .key(key)
        .body(ByteStream::from(data))
        .content_type(content_type)
        .send()
        .await?;

    Ok(key.to_string())
}

pub async fn delete_object(
    client: &Client,
    bucket_name: impl Into<String>,
    key: &str,
) -> Result<(), aws_sdk_s3::Error> {
    client
        .delete_object()
        .bucket(bucket_name)
        .key(key)
        .send()
        .await?;

    Ok(())
}
