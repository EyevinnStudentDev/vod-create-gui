#!/bin/sh

# Set port to 3000 if not provided
PORT="${PORT:-3000}"
echo "Starting Next.js on port $PORT..."

# Start Next.js
exec node server.js -p $PORT
