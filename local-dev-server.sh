#!/bin/bash
echo "🚀 Starting local development server..."
echo "🚀 Starting local development server..."
echo "📍 Serving: WIP/v1/ on http://localhost:3002"
echo "📍 Container test server: http://localhost:3001"
echo "Press Ctrl+C to stop"

# Use a different port for local vs container
npx http-server WIP/v1 -p 3002 -a localhost -c-1 --cors
