#!/bin/bash
# Start the new container
docker run -d --name career-docs-api \
  --env-file /home/ubuntu/career-docs-api/.env \
  -p 80:3000 \
  coltonrobbins73/career-docs-api:latest