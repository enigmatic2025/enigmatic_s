#!/bin/sh

# Start Temporal Dev Server in the background
# -ip 0.0.0.0 allows internal binding
# --db-filename persists state to disk (optional, requires volume)
echo "Starting Temporal Dev Server..."
temporal server start-dev --ip 0.0.0.0 &

# Wait for Temporal to be ready (Simple sleep for MVP)
echo "Waiting for Temporal to start..."
sleep 10

# Start the Backend Application
# use 'exec' so the Go process replaces the shell and receives signals (SIGTERM)
echo "Starting Backend API..."
exec /usr/local/bin/backend-api
