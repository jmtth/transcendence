# ==========================
# Stage 1 — Builder
# ==========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy ROOT workspace manifests
COPY package.json package-lock.json ./

# les manisfests du service
COPY srcs/auth/package.json ./srcs/auth/package.json

# Install full workspace deps
RUN npm ci

# Copy full monorepo
COPY . .

# Build auth-service only
RUN npm run build --workspace srcs/auth


# ==========================
# Stage 2 — Runner
# ==========================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install runtime-only system deps (wget for healthcheck)
RUN apk add --no-cache wget

# Copy runtime deps and built artefacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/srcs/auth/dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"]

