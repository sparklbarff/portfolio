# Portfolio Development Environment
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for development
RUN apk add --no-cache \
    git \
    bash \
    curl \
    wget

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy project files
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S portfolio -u 1001

# Change ownership of app directory
RUN chown -R portfolio:nodejs /app
USER portfolio

# Expose development port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001 || exit 1

# Development command
CMD ["npm", "run", "dev"]
