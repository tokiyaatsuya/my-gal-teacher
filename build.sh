#!/bin/bash
set -e
echo "=== Step 1: OpenNext build ==="
npx opennextjs-cloudflare build

echo "=== Step 2: Copy worker ==="
cp .open-next/worker.js .open-next/_worker.js

echo "=== Step 3: Copy static assets ==="
mkdir -p .open-next/_next
cp -r .open-next/assets/_next/static .open-next/_next/static

echo "=== Done! Checking results ==="
ls -la .open-next/_worker.js
ls -la .open-next/_next/static/
