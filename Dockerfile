# Build the Vite frontend and package it with the Express API.
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies first so Docker can cache this layer.
COPY package*.json ./
RUN npm ci

# Vite needs the root index.html and vite.config.ts as well as src/.
COPY . .
RUN npm run build

# Run the API and serve the built frontend from the same container.
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/dist ./dist

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "--import", "tsx", "src/server.ts"]
