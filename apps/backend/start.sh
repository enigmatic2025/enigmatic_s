#!/bin/sh

# Start Temporal Dev Server in the background
# -ip 0.0.0.0 allows internal binding
# --db-filename persists state to disk (optional, requires volume)
echo "Starting Temporal Dev Server..."
temporal server start-dev --ip 0.0.0.0 &

# Wait for Temporal to be ready by checking port 7233
echo "Waiting for Temporal to start..."
until nc -z localhost 7233; do
  echo "Waiting for Temporal..."
  sleep 1
done
echo "Temporal started!"

# Start the Backend Application
# use 'exec' so the Go process replaces the shell and receives signals (SIGTERM)
echo "Starting Backend API..."
exec /usr/local/bin/backend-api
