# ==========================
# Stage 1 — Builder
# ==========================

# ==========================
# Paths should be written from root
# ==========================

FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copier UNIQUEMENT les manifests racine
COPY package.json package-lock.json ./

# les manisfest du service
COPY srcs/gateway/package.json ./srcs/gateway/package.json

# 2. Installation déterministe du monorepo
RUN npm ci

# 3. Copier tout le code
COPY . .

# 4. Build uniquement la gateway
RUN npm run build --workspace srcs/gateway

# ==========================
# Stage 2 — Production
# ==========================

FROM node:20-alpine AS runner

# Keep the same workspace root as builder
WORKDIR /app

ENV NODE_ENV=production

# 5. Copier uniquement ce qui est nécessaire à la gateway
COPY --from=builder /app/srcs/gateway/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/index.js"]

