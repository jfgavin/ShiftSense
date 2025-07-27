#!/bin/bash

set -e  # Exit on error

CONTAINER_NAME="reactnative-dev"

echo "🔧 Building image if needed..."
docker-compose build

echo "🚀 Starting container..."
docker-compose up -d

# Wait a moment to ensure it's started
sleep 2

# Check if the container is running
RUNNING=$(docker inspect -f '{{.State.Running}}' $CONTAINER_NAME 2>/dev/null)

if [ "$RUNNING" != "true" ]; then
  echo "❌ Container failed to start."
  docker logs $CONTAINER_NAME
  exit 1
fi

echo "✅ Container is running. Entering shell..."
docker exec -it $CONTAINER_NAME bash
