# syntax=docker/dockerfile:1.7

### BUILDER STAGE
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy manifests first for maximum cache reuse
COPY package.json bun.lock ./

# Cache Bun downloads between builds
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Copy source only after deps are installed
COPY . .

# Build app
RUN bun run build && chmod +x entrypoint.sh

# Package runtime artifacts
RUN tar -czf build.tar.gz \
    dist \
    static \
    migration.ts \
    entrypoint.sh \
    package.json \
    bun.lock

### RUNNER STAGE
FROM oven/bun:1-alpine AS runner

WORKDIR /app

RUN apk add --no-cache curl wget

# Copy manifests first
COPY package.json bun.lock ./

# Reuse Bun cache here too
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --production --frozen-lockfile

# Copy build artifacts
COPY --from=builder /app/build.tar.gz ./

RUN tar -xzf build.tar.gz && \
    rm build.tar.gz

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]