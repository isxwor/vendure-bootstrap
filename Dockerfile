### Builder stage
FROM node:24-alpine AS builder
WORKDIR /app

# Copy package.json and yarn.lock first to leverage caching
COPY package.json yarn.lock ./

# Install dependencies for build
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy the rest of the source code
COPY . .

# Build the project
RUN yarn build && \
    chmod +x entrypoint.sh

### Runner stage
FROM node:24-alpine AS runner
WORKDIR /app

# Copy production dependencies (package.json + yarn.lock)
COPY package.json yarn.lock ./

# Install dependencies
RUN apk add --no-cache curl wget && \
    yarn install --production --frozen-lockfile --network-timeout 100000 && \
    yarn cache clean --all && \
    rm -rf ~/.cache /usr/local/share/.cache/* /var/cache/apk/* /tmp/* /usr/share/man /usr/share/doc

# Copy build artifacts from builder
COPY --from=builder /app/src /app/dist /app/static /app/entrypoint.sh /app/tsconfig*.json /app/migration.ts ./

# Expose port and set entrypoint
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]

