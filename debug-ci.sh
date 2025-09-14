#!/bin/bash
set -e

echo "=== DEBUG CI SETUP ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Python version: $(python --version)"
echo "Current directory: $(pwd)"
echo "Files in directory:"
ls -la

echo ""
echo "=== INSTALLING DEPENDENCIES ==="
npm install

echo ""
echo "=== INSTALLING PLAYWRIGHT ==="
npx playwright install chromium

echo ""
echo "=== STARTING SERVER ==="
python -m http.server 8080 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

echo "Waiting 5 seconds for server..."
sleep 5

echo ""
echo "=== TESTING SERVER ==="
curl -v http://localhost:8080 || echo "Server test failed"

echo ""
echo "=== RUNNING BASIC TEST ==="
npx playwright test tests/regression/homepage-navigation.spec.js --project=regression-chromium --timeout=10000 --max-failures=1 || echo "Tests failed"

echo ""
echo "=== CLEANUP ==="
kill $SERVER_PID || echo "Could not kill server"

echo "Debug complete!"