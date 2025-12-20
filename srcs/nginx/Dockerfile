# ==========================
# Stage 1 — Builder
# ==========================

FROM node:20-alpine AS builder
WORKDIR /build

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy code and build
COPY . .
RUN npm run build

# ==========================
# Stage 2 — Production
# ==========================

FROM nginx:alpine

# Install wget for health check
RUN apk add --no-cache wget

# Remove default nginx conf
RUN rm /etc/nginx/conf.d/default.conf || true

# Remove official entrypoint scripts
RUN rm -f /docker-entrypoint.d/*

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf
# Assets should be bundled by Vite under dist/assets (from src/assets) : no need to copy
# COPY ./src/assets         /usr/share/nginx/html/assets

# Copy React app built with Vite
COPY --from=builder /build/dist /usr/share/nginx/src/html/

# Create directory for uploads
RUN mkdir -p /usr/share/nginx/html/uploads \
  && chmod 755 /usr/share/nginx/html/uploads

# RUN DNS=$(grep nameserver /etc/resolv.conf | head -n1 | awk '{print $2}') \
#     && sed -i "s|__DNS__|$DNS|g" /etc/nginx/nginx.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
