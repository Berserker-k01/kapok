# ============================================
# Dockerfile Multi-Stage — Assimε Platform
# Build: frontends + server → image de production
# ============================================

# --- STAGE 1: Build User Panel ---
FROM node:18-alpine AS build-user
WORKDIR /build
COPY user-panel/package*.json ./
RUN npm ci
COPY user-panel/ .
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# --- STAGE 2: Build Admin Panel ---
FROM node:18-alpine AS build-admin
WORKDIR /build
COPY admin-panel/package*.json ./
RUN npm ci
COPY admin-panel/ .
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# --- STAGE 3: Production Server ---
FROM node:18-alpine AS production

LABEL maintainer="Assimε Team"
LABEL description="Plateforme e-commerce multi-tenant Assimε"

# Structure miroir du projet local pour que les paths relatifs dans index.js fonctionnent
# index.js utilise: path.join(__dirname, '../../admin-panel/dist')
# __dirname = /app/server/src → ../../admin-panel/dist = /app/admin-panel/dist ✅
WORKDIR /app/server

# Installer uniquement les dépendances de production du serveur
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copier le code serveur
COPY server/src/ ./src/
COPY server/database/ ./database/

# Copier les frontends buildés dans la structure attendue
COPY --from=build-user /build/dist /app/user-panel/dist
COPY --from=build-admin /build/dist /app/admin-panel/dist

# Créer les dossiers nécessaires (uploads relatif au WORKDIR = /app/server/uploads)
RUN mkdir -p uploads/payment-proofs /app/server/logs && \
    chmod -R 755 uploads /app/server/logs

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:5000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["node", "src/index.js"]
