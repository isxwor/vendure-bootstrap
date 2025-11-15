### BUILDER STAGE
FROM node:24-alpine AS builder

WORKDIR /app

# Copy only dependency manifests first — best caching
COPY package.json yarn.lock ./

# Use BuildKit cache mounts for Yarn cache 
RUN --mount=type=cache,target=/root/.cache/yarn \
    yarn install --frozen-lockfile --network-timeout 100000

# Copy the full source (after deps, so dependencies layer is cached)
COPY . .

# Build the project
RUN yarn build && chmod +x entrypoint.sh

# Package only what is needed for the runner stage
# (src → dist, static assets, config files, entrypoint)
RUN tar -czf build.tar.gz \
    src \
    dist \
    static \
    tsconfig*.json \
    migration.ts \
    entrypoint.sh

### RUNNER STAGE
FROM node:24-alpine AS runner

WORKDIR /app

# Install required runtime tools (minimal)
RUN apk add --no-cache curl wget tar

# Copy production dependency manifest
COPY package.json yarn.lock ./

# BuildKit cache for yarn + minimal production install
RUN --mount=type=cache,target=/root/.cache/yarn \
    yarn install --prod --frozen-lockfile --network-timeout 100000 && \
    yarn cache clean --all

# Extract artifacts from builder stage
COPY --from=builder /app/build.tar.gz ./
RUN tar -xzf build.tar.gz && rm build.tar.gz /var/cache/apk/* /tmp/* /usr/share/man /usr/share/doc

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]

