#!/bin/bash
# Pull the latest image from Docker Hub
docker pull coltonrobbins73/career-docs-api:latest

# Get secrets from Secrets Manager
SECRET_ARN=$(aws secretsmanager describe-secret --secret-id CareerDocsApiEnvVariables --query ARN --output text)
SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id "$SECRET_ARN" --query SecretString --output text)

# Create a .env file from the secrets
echo "$SECRET_JSON" | jq -r 'to_entries | map("\(.key)=\(.value|tostring)") | .[]' > /home/ubuntu/career-docs-api/.env