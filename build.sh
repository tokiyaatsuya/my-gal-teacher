#!/bin/bash
set -e
echo "=== Step 1: OpenNext build ==="
npx opennextjs-cloudflare build

echo "=== Step 2: Copy worker ==="
cp .open-next/worker.js .open-next/_worker.js

echo "=== Step 3: Copy static assets ==="
mkdir -p .open-next/_next
cp -r .open-next/assets/_next/static .open-next/_next/static

echo "=== Step 4: Copy edge chunks (for Edge API routes) ==="
mkdir -p .open-next/server/edge
cp -r .next/server/edge/chunks .open-next/server/edge/chunks

echo "=== Step 5: Copy public assets ==="
cp -r .open-next/assets/. .open-next/

echo "=== Step 6: Generate _routes.json ==="
cat > .open-next/_routes.json << 'EOF'
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/_next/static/*", "/characters/*", "/favicon.ico"]
}
EOF

echo "=== Done! Checking results ==="
ls -la .open-next/_worker.js
ls -la .open-next/_next/static/
