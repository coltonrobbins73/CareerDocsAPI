#!/bin/bash
# Stop the running container
docker stop career-docs-api || true
docker rm career-docs-api || true