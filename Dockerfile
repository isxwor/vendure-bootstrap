# Use a stable LTS Node.js version explicitly in both stages
FROM node:lts-alpine AS builder_amd64
WORKDIR /app

# Copy package.json and yarn.lock before installing dependencies
COPY package.json yarn.lock ./

# Install dependencies before copying the entire source code
RUN yarn install --network-timeout 100000

# Copy the rest of the application
COPY . .

# Build the project
RUN yarn build && \
    tar -czf build.tar.gz src static migration.ts tsconfig.json tsconfig.dashboard.json entrypoint.sh

# Runner stage - Use the same Node.js LTS version
FROM node:lts-alpine AS runner_amd64
WORKDIR /app

# Install dependencies (curl or wget for healthcheck)
RUN apk update && \
    apk upgrade && \
    apk add --no-cache curl

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install production dependencies **before** extracting build files
RUN yarn install --production --network-timeout 100000 && \
    yarn cache clean --all

# Copy built files from the builder stage
COPY --from=builder_amd64 /app/build.tar.gz ./

# Extract build files and clean up tar.gz
RUN tar -xzf build.tar.gz && \
    rm -rf build.tar.gz && \
    chmod +x entrypoint.sh

# Cleanup unnecessary files to reduce image size
RUN rm -rf ~/.cache/* /usr/local/share/.cache/* /var/cache/apk/* /tmp/* /usr/share/man /usr/share/doc

# Expose the application port and set entrypoint
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
