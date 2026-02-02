# ==========================
# Stage 1 — Builder
# ==========================
FROM node:20-alpine AS builder

# Native deps for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 1. Copy ROOT workspace manifests
COPY package.json package-lock.json ./

# les manisfests du service
COPY srcs/users/package.json ./srcs/users/package.json

# 2. Install full workspace deps (deterministic)
RUN npm ci

# 3. Copy full monorepo
COPY . .

# 4. Generate Prisma client (users workspace)
WORKDIR /app/srcs/users
RUN npx prisma generate

# 5. Build users service ONLY
WORKDIR /app
RUN npm run build --workspace srcs/users


# ==========================
# Stage 2 — Runner
# ==========================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# 6. Copy runtime deps and built artefacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/srcs/users/dist ./dist

# Prisma runtime files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Config & prisma schema (runtime usage)
COPY --from=builder /app/srcs/users/src/config ./src/config
COPY --from=builder /app/srcs/users/prisma ./prisma
COPY --from=builder /app/srcs/users/prisma.config.ts ./prisma.config.ts

# Entry point
COPY --from=builder /app/srcs/users/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Runtime dirs
RUN mkdir -p /app/data /app/uploads

EXPOSE 5555

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/index.js"]

