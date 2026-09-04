FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef

WORKDIR /app


FROM chef AS planner

COPY Cargo.toml Cargo.lock ./
COPY apps/ ./apps/
COPY packages/ ./packages/

RUN cargo chef prepare --recipe-path recipe.json


FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json

RUN apt-get update && apt-get install -y pkg-config libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

RUN cargo chef cook --release --bin zelefy_gateway --recipe-path recipe.json

COPY Cargo.toml Cargo.lock ./
COPY apps/ ./apps/
COPY packages/ ./packages/

RUN cargo build --release --bin zelefy_gateway


FROM debian:trixie-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/zelefy_gateway /app/gateway

EXPOSE 8000

CMD ["./gateway"]
