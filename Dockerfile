# Multi-stage build for Node.js backend and React frontend

# Stage 1: Build React frontend (production only)
FROM node:18-alpine AS client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm install --only=production

# Copy client source
COPY client/ ./

# Build React app
RUN npm run build

# Stage 2: Setup Node.js backend
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY package*.json ./

# Install backend dependencies
#RUN npm ci --only=production
RUN npm install --only=production

# Stage 3: Production image
FROM node:18-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy backend dependencies from builder
COPY --from=backend-builder /app/node_modules ./node_modules

# Copy backend source code
COPY . .

# Copy built React app from client-builder (only in production)
# Development mode will serve frontend from separate dev server
COPY --from=client-builder /app/client/build ./client/build

# Create uploads directory
RUN mkdir -p uploads/images uploads/media uploads/resumes uploads/gallery

# Set permissions for uploads
RUN chmod -R 755 uploads

# Expose port

EXPOSE 5600

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5600/health || exit 1

# Start the application
CMD ["node", "server.js"]
