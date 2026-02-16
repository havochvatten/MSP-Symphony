#!/bin/bash
set -e

CERT="/workspace/frontend/ssl/server.crt"
KEY="/workspace/frontend/ssl/server.key"

# Check if certificate and key exist
if [ ! -f "$CERT" ] || [ ! -f "$KEY" ]; then
  echo "SSL certificate or key not found. Generating..."
  cd /workspace/frontend && npm run generate-cert
fi

cd /workspace/frontend && PROXY_TARGET=local ng serve --ssl --host 0.0.0.0
