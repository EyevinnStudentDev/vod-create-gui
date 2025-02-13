#!/bin/sh
set -e

# Check if PORT is set, otherwise default to 3000
PORT=${PORT:-3000}
echo "Starting Next.js application on port $PORT..."

# Run Next.js application with the correct port
exec npm run start -- -p $PORT
