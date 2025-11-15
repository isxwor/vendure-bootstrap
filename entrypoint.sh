#!/usr/bin/env sh

# ANSI color codes
YELLOW="$(printf '\033[1;33m')"
NC="$(printf '\033[0m')"

# Source environment variables
SCRIPT_DIR=$(dirname "$0")
if [ -f "$SCRIPT_DIR/.env" ]; then
  echo "Sourcing environment variables..."
  set -a
  # shellcheck source=/dev/null
  . "$SCRIPT_DIR/.env"
  set +a
fi

# Run migrations first but continue if they fail
# echo "Running migrations..."
# if ! yarn migration:run; then
#     printf "%s⚠ Migration failed, continuing...%s\n" "$YELLOW" "$NC"
# fi

# Function to kill both processes on exit
cleanup() {
  echo "Stopping Vendure server and worker..."
  kill "$SERVER_PID" "$WORKER_PID" 2>/dev/null
  exit
}

trap cleanup INT TERM

# Start Vendure worker in background
echo "Starting Vendure worker..."
yarn start:worker &
WORKER_PID=$!

# Start Vendure server in background
echo "Starting Vendure server..."
yarn start:server &
SERVER_PID=$!

# Wait for both to finish
wait "$WORKER_PID" "$SERVER_PID"

