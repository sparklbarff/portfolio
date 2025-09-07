#!/bin/bash
# Mac/Linux script to setup Docker environment

echo "Starting Portfolio Docker Setup..."
echo "================================"

# Check if Docker is running
if ! docker version >/dev/null 2>&1; then
    echo "❌ ERROR: Docker is not running or not installed"
    echo "Please start Docker Desktop first"
    exit 1
fi

echo "✅ Docker is running!"

# Build the container
echo "🔨 Building portfolio development container..."
if ! docker build -t portfolio-dev .; then
    echo "❌ ERROR: Failed to build container"
    exit 1
fi

# Start the development environment
echo "🚀 Starting development environment..."
if ! docker-compose up -d portfolio-dev; then
    echo "❌ ERROR: Failed to start development environment"
    exit 1
fi

echo ""
echo "🎉 SUCCESS! Your portfolio is now running in Docker!"
echo "=================================================="
echo ""
echo "🌐 Development server: http://localhost:3001"
echo ""
echo "Commands you can use:"
echo "  🛑 Stop: docker-compose down"
echo "  📝 View logs: docker-compose logs -f portfolio-dev"
echo "  📊 Check status: docker-compose ps"
echo ""
echo "Ready for CRT effects development! 🎮✨"
