# ==========================
# Stage 1 — Builder
# ==========================
FROM node:20-alpine AS builder

RUN apk add --no-cache wget python3 make g++
WORKDIR /app

# Installer les deps (dev + prod)
COPY package*.json ./
COPY srcs/shared/core/package*.json ./srcs/shared/core/
COPY srcs/auth/package*.json ./srcs/auth/
RUN npm ci

COPY srcs/shared/core/ ./srcs/shared/core
COPY srcs/auth ./srcs/auth

# RUN npm run build -w @transcendence/core
# RUN npm run build -w @transcendence/auth
RUN npx tsc -b srcs/auth/tsconfig.json --force

WORKDIR /app
RUN npm prune --omit=dev

# ==========================
# Stage 2 — Production
# ==========================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/srcs/shared/core/dist ./srcs/shared/core/dist
COPY --from=builder /app/srcs/shared/core/package.json ./srcs/shared/core/package.json

WORKDIR /app/srcs/auth
COPY --from=builder /app/srcs/auth/package.json ./
COPY --from=builder /app/srcs/auth/dist ./dist

ENV HUSKY=0
ENV NODE_ENV=production

# Installer wget pour health check
# RUN apk add --no-cache wget
# RUN apk add --no-cache python3 make g++

EXPOSE 3001

CMD ["node", "dist/index.js"]
