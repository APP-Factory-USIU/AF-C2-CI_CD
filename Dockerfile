# ==============================================================================
# Multi-Stage Dockerfile for Reproducible Node.js + TypeScript Environment
# University Course: Software Engineering & DevOps
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Builder
# Purpose: Compile TypeScript to JavaScript with all devDependencies (compilers, types).
# This stage is discarded in production to minimize final image size and reduce CVE surface.
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json tsconfig.json ./

# Install all dependencies (including devDependencies required for tsc build)
# npm ci ensures exact reproducible dependency trees matching package-lock.json
RUN npm ci

# Copy application source code
COPY src/ ./src/

# Compile TypeScript to dist/ directory
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: Production Runner
# Purpose: Minimal, secure runtime container containing only compiled JS and production deps.
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Set production environment flag
ENV NODE_ENV=production
ENV PORT=3000

# Copy dependency manifests
COPY package*.json ./

# Install ONLY production dependencies (pruning compilers, types, and test tools)
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript output from Stage 1
COPY --from=builder /usr/src/app/dist ./dist

# Security Hardening: Switch from root to non-privileged 'node' user provided by Alpine
USER node

# Expose API port
EXPOSE 3000

# Health check to allow container orchestrators (or Docker) to monitor container health
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the compiled Node.js application
CMD ["node", "dist/server.js"]
