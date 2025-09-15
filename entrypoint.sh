#!/usr/bin/env sh

# Source environment variables
if [ -f /app/.env ]; then
  echo "Sourcing environment variables..."
  set -a
  . /app/.env
  set +a
fi

echo "Running migrations..."
yarn migration:run || true

echo "Starting vendire server..."
yarn start
