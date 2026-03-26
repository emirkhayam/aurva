# Multi-stage Dockerfile for AURVA Backend on Railway
# Optimized for production deployment with persistent storage

FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install TypeScript globally first (to avoid npm timeout issues)
RUN npm install -g typescript

# Copy package files
COPY package*.json ./

# Install dependencies with timeout workaround
RUN npm install --verbose || npm install --verbose

# Copy source code
COPY . .

# Build TypeScript using global tsc
RUN tsc

# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Copy public files (HTML pages, static assets, uploads)
COPY --from=builder /app/public ./public

# Create uploads and logs directories with proper permissions
RUN mkdir -p /app/uploads /app/public/uploads /app/logs && chown -R node:node /app/uploads /app/public/uploads /app/logs

# Switch to non-root user
USER node

# Expose port (configurable via PORT env var, defaults to 3000 in docker-compose)
EXPOSE 3000

# Health check - use PORT env var with fallback
# Increased start_period to 90s to allow Supabase connection check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD node -e "const port = process.env.PORT || 3000; require('http').get('http://localhost:' + port + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/server.js"]
