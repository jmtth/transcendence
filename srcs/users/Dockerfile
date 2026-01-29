# ==========================
# Stage 1 — Builder
# ==========================

# ==========================
# Paths should be written from root
# ==========================

FROM node:20-alpine AS builder

# needed for better-sqlite3
RUN apk add --no-cache python3 make g++
WORKDIR /app

COPY package*.json ./
COPY srcs/shared/core/package*.json ./srcs/shared/core/
COPY srcs/users/package*.json ./srcs/users/
RUN npm ci

COPY srcs/shared/core ./srcs/shared/core
COPY srcs/users ./srcs/users
COPY srcs/users/prisma ./srcs/users/prisma
COPY srcs/users/prisma.config.ts ./srcs/users/

RUN ls -la /app/node_modules/@prisma/client/runtime/ || echo "No runtime directory for prisma client"
RUN find /app/node_modules/@prisma -name "*.wasm*" || echo "No .wasm file found"

RUN npx prisma generate --schema=./srcs/users/prisma/schema.prisma

RUN cd srcs/users && npx vite build

RUN npm prune --omit=dev

# ==========================
# Stage 2 — Production
# ==========================

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV HUSKY=0

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/srcs/shared/core/dist ./srcs/shared/core/dist
COPY --from=builder /app/srcs/shared/core/package.json ./srcs/shared/core/package.json

WORKDIR /app/srcs/users
COPY --from=builder /app/srcs/users/package.json ./
COPY --from=builder /app/srcs/users/dist ./dist

COPY --from=builder /app/srcs/users/src/config/ ./src/config
COPY --from=builder /app/srcs/users/prisma ./prisma
COPY --from=builder /app/srcs/users/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/srcs/users/entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh && mkdir -p /app/data /app/uploads
RUN apk add --no-cache openssl

WORKDIR /app/srcs/users

ENTRYPOINT [ "./entrypoint.sh" ]

CMD ["node", "dist/index.js"]
