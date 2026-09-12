FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef

WORKDIR /app


FROM chef AS planner

COPY Cargo.toml Cargo.lock ./
COPY packages/shared-rs/ ./packages/shared-rs/

COPY apps/gateway/ ./apps/gateway/

RUN mkdir -p apps/profiles/src apps/auth/src apps/desktop/src-tauri/src apps/desktop/core/src && \
    echo 'fn main() {}' > apps/profiles/src/main.rs && echo '[package]\nname = "zelefy_profiles"\nversion = "0.1.0"' > apps/profiles/Cargo.toml && \
    echo 'fn main() {}' > apps/auth/src/main.rs && echo '[package]\nname = "zelefy_auth"\nversion = "0.1.0"' > apps/auth/Cargo.toml && \
    echo 'fn main() {}' > apps/desktop/src-tauri/src/main.rs && echo '[package]\nname = "zelefy_desktop_tauri"\nversion = "0.1.0"' > apps/desktop/src-tauri/Cargo.toml && \
    echo 'fn main() {}' > apps/desktop/core/src/main.rs && echo '[package]\nname = "core"\nversion = "0.1.0"' > apps/desktop/core/Cargo.toml

RUN cargo chef prepare --recipe-path recipe.json


FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json

RUN apt-get update && apt-get install -y pkg-config libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

RUN cargo chef cook --release --bin zelefy_gateway --recipe-path recipe.json

COPY Cargo.toml Cargo.lock ./
COPY apps/gateway/ ./apps/gateway/
COPY packages/shared-rs/ ./packages/shared-rs/

RUN cargo build --release --bin zelefy_gateway


FROM debian:trixie-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/zelefy_gateway /app/gateway

CMD ["./gateway"]
