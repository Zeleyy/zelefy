use std::time::Duration;
use axum::{body::Body, http::Request, response::Response};
use tower_http::trace::{DefaultOnFailure, TraceLayer};
use tracing::{field, Level, Span};
use tracing_subscriber::fmt::format::FmtSpan;

pub fn init_tracing() {
    tracing_subscriber::fmt()
        .compact()
        .with_target(false)
        .with_span_events(FmtSpan::NONE)
        .init();
}

pub fn build_trace_layer() -> TraceLayer<
    tower_http::classify::SharedClassifier<tower_http::classify::ServerErrorsAsFailures>,
    impl tower_http::trace::MakeSpan<Body> + Clone,
    impl tower_http::trace::OnRequest<Body> + Clone,
    impl tower_http::trace::OnResponse<Body> + Clone,
    tower_http::trace::DefaultOnBodyChunk,
    tower_http::trace::DefaultOnEos,
    DefaultOnFailure,
> {
    TraceLayer::new_for_http()
        .make_span_with(|request: &Request<Body>| {
            tracing::info_span!(
                "request",
                method = %request.method(),
                uri = %request.uri(),
                version = ?request.version(),
                error.code = field::Empty,
                error.source = field::Empty,
            )
        })
        .on_request(|_request: &Request<Body>, _span: &Span| {})
        .on_failure(DefaultOnFailure::new().level(Level::TRACE))
        .on_response(|response: &Response, latency: Duration, _span: &Span| {
            let status = response.status();
            let latency_ms = latency.as_millis();

            if status.is_server_error() {
                tracing::error!(
                    status = %status.as_u16(),
                    latency_ms,
                    "finished processing request with server error"
                );
            } else if status.is_client_error() {
                tracing::warn!(
                    status = %status.as_u16(),
                    latency_ms,
                    "finished processing request with client error"
                );
            } else {
                tracing::info!(
                    status = %status.as_u16(),
                    latency_ms,
                    "finished processing request"
                );
            }
        })
}
