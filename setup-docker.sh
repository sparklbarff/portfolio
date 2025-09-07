#!/bin/bash
# Portfolio Docker + AI/Codex Setup Script

set -e

echo "🚀 Portfolio Docker + AI/Codex Setup"
echo "=================================="

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available"
    echo "Please install Docker Compose first"
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Build the development container
echo "🔨 Building portfolio development container..."
docker build -t portfolio-dev .

# Start the development environment
echo "🚀 Starting portfolio development environment..."
docker-compose up -d portfolio-dev

# Wait for container to be ready
echo "⏳ Waiting for container to be ready..."
sleep 5

# Check container status
if docker-compose ps | grep -q "portfolio-dev.*Up"; then
    echo "✅ Portfolio development container is running!"
    echo ""
    echo "🌐 Development server: http://localhost:3001"
    echo "🐳 Container status: docker-compose ps"
    echo "📝 Container logs: docker-compose logs -f portfolio-dev"
    echo "🛑 Stop container: npm run docker:stop"
    echo ""
    echo "🤖 AI/Codex Extensions Available:"
    echo "  - OpenAI Codex (openai.chatgpt)"
    echo "  - Claude/Cline (saoudrizwan.claude-dev)" 
    echo "  - GitHub Copilot (github.copilot)"
    echo "  - Continue.dev (continue.continue)"
    echo ""
    echo "Ready for CRT effects development! 🎮✨"
else
    echo "❌ Failed to start portfolio development container"
    echo "Check logs: docker-compose logs portfolio-dev"
    exit 1
fi
