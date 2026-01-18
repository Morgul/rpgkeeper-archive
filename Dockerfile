# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for grunt build)
RUN npm ci

# Copy source files
COPY . .

# Run grunt build to compile LESS and templates
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/client ./client
COPY --from=builder /app/systems ./systems
COPY --from=builder /app/server ./server
COPY --from=builder /app/config.js ./
COPY --from=builder /app/server.js ./

# Create directories for database and session mounts
RUN mkdir -p /app/server/db /app/server/sessions

# Expose the application port
EXPOSE 8081

# Environment variables (to be provided at runtime)
ENV NODE_ENV=production
ENV LOG_LEVEL=info

# Start the application
CMD ["node", "server.js"]
