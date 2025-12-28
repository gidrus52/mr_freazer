# Multi-stage build для nginx с frontend
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend files
COPY frontend/package*.json ./

# Install dependencies with retry and timeout
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy only necessary files (exclude large archives and unnecessary files)
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html ./
COPY frontend/package.json ./
COPY frontend/tsconfig.json ./
COPY frontend/tsconfig.node.json ./
COPY frontend/vite.config.ts ./
COPY frontend/babel.config.js ./

# Exclude large files
RUN find . -name "*.rar" -delete && \
    find . -name "*.zip" -delete && \
    find . -name "*.tar" -delete && \
    find . -name "*.tar.gz" -delete

# Увеличиваем лимит памяти для Node.js при сборке (4GB)
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Stage 2: Nginx with frontend
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend from builder
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

