# 🐳 Docker + AI/Codex Development Setup

Complete Docker-based development environment for your CRT effects portfolio with AI/Codex integration.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- VS Code with recommended extensions

### Setup Commands
```bash
# Automated setup
./setup-docker.sh

# Manual setup
npm run docker:build    # Build container
npm run docker:dev      # Start development environment
npm run docker:stop     # Stop containers
npm run docker:clean    # Clean up containers and images
```

## 🎯 Development Workflow

### Development Server
```bash
# Start development environment
docker-compose up portfolio-dev

# Access your portfolio
open http://localhost:3001

# View logs
docker-compose logs -f portfolio-dev
```

### Production Testing
```bash
# Test with Nginx (production-like setup)
npm run docker:prod-test

# Access production test
open http://localhost:8080
```

## 🤖 AI/Codex Integration

### Installed Extensions
- **OpenAI Codex** (`openai.chatgpt`) - Direct GPT integration
- **Claude/Cline** (`saoudrizwan.claude-dev`) - Autonomous coding agent
- **GitHub Copilot** (`github.copilot`) - Real-time suggestions  
- **Continue.dev** (`continue.continue`) - Local LLM support

### Usage Examples
```javascript
// Use AI assistants for:
// 1. CRT physics improvements
// 2. Performance optimization  
// 3. Cross-browser compatibility
// 4. Code refactoring

// Example: Ask Codex to enhance CRT effects
// "Make the phosphor decay more realistic based on P22 specifications"
```

## 📁 Container Architecture

### File Structure
```
portfolio/
├── Dockerfile              # Development container
├── docker-compose.yml      # Multi-service setup
├── .dockerignore           # Excluded files
├── nginx.conf              # Production test config
└── .devcontainer/          # VS Code dev container
    └── devcontainer.json   # Container configuration
```

### Volume Mapping
- **Hot Reload**: `./WIP/v1` → `/app/WIP/v1`
- **Assets**: `./assets` → `/app/assets`
- **Node Modules**: Preserved in container for performance

## 🔧 Container Features

### Development Container
- **Base**: Node.js 18 Alpine Linux
- **User**: Non-root `portfolio` user for security
- **Ports**: 3001 (dev server), 9229 (debug)
- **Health Check**: Automatic service monitoring

### Production Test Container  
- **Base**: Nginx Alpine
- **Features**: Gzip compression, security headers
- **Caching**: Static asset optimization
- **Port**: 8080

## 🚨 Troubleshooting

### Common Issues
```bash
# Container won't start
docker-compose logs portfolio-dev

# Port conflicts
docker-compose down
lsof -ti:3001 | xargs kill -9

# Permission issues
docker-compose exec portfolio-dev chown -R portfolio:nodejs /app

# Clean slate
npm run docker:clean
```

### Performance Optimization
```bash
# Monitor container resources
docker stats portfolio-dev

# Check container size
docker images portfolio-dev

# Optimize build cache
docker builder prune
```

## 🎮 CRT Effects Development

### Hot Reloading
Your WIP/v1 directory is mounted for instant file changes:
- Edit files locally
- See changes immediately at http://localhost:3001
- No container restart needed

### AI-Assisted Development
1. **Cline**: For complex refactoring and feature implementation
2. **Codex**: For specific code generation and optimization
3. **Copilot**: For real-time coding assistance
4. **Continue.dev**: For local LLM privacy-first development

### Performance Testing
```bash
# Test CRT effects performance in container
npm run test:effects

# Analyze performance metrics
npm run analyze:performance

# Cross-browser testing
# Use production test environment on port 8080
```

## 📊 Container Monitoring

### Health Checks
- Automatic health monitoring
- Service recovery on failure
- Resource usage tracking

### Logging
```bash
# Real-time logs
docker-compose logs -f portfolio-dev

# Error-only logs
docker-compose logs --tail=50 portfolio-dev | grep ERROR

# Container metrics
docker exec portfolio-dev top
```

## 🌟 Production Deployment

When ready to deploy:
```bash
# Test production build
npm run docker:prod-test

# Copy optimized files to root
rsync -av WIP/v1/ ./ --exclude=node_modules

# Deploy to your hosting platform
```

---

**Status**: ✅ Ready for Docker-based CRT effects development with AI/Codex integration!

Your development environment now includes professional Docker containerization with hot reloading, AI coding assistants, and production testing capabilities. Perfect for developing your world-class CRT simulation system! 🎯✨
