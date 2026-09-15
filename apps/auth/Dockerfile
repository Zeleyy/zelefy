FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef

WORKDIR /app


FROM chef AS planner

COPY Cargo.toml Cargo.lock ./
COPY packages/shared-rs/ ./packages/shared-rs/

COPY apps/auth/ ./apps/auth/

RUN mkdir -p apps/profiles/src apps/gateway/src apps/desktop/src-tauri/src apps/desktop/core/src && \
    echo 'fn main() {}' > apps/profiles/src/main.rs && echo '[package]\nname = "zelefy_profiles"\nversion = "0.1.0"' > apps/profiles/Cargo.toml && \
    echo 'fn main() {}' > apps/gateway/src/main.rs && echo '[package]\nname = "zelefy_gateway"\nversion = "0.1.0"' > apps/gateway/Cargo.toml && \
    echo 'fn main() {}' > apps/desktop/src-tauri/src/main.rs && echo '[package]\nname = "zelefy_desktop_tauri"\nversion = "0.1.0"' > apps/desktop/src-tauri/Cargo.toml && \
    echo 'fn main() {}' > apps/desktop/core/src/main.rs && echo '[package]\nname = "core"\nversion = "0.1.0"' > apps/desktop/core/Cargo.toml

RUN cargo chef prepare --recipe-path recipe.json


FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json

RUN apt-get update && apt-get install -y pkg-config libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

ENV SQLX_OFFLINE=true

RUN cargo chef cook --release --bin zelefy_auth --recipe-path recipe.json

COPY Cargo.toml Cargo.lock ./
COPY apps/auth/ ./apps/auth/
COPY packages/shared-rs/ ./packages/shared-rs/
COPY apps/auth/.sqlx/ ./.sqlx/

RUN cargo build --release --bin zelefy_auth


FROM debian:trixie-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/zelefy_auth /app/auth

CMD ["./auth"]
