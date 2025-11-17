FROM nginx:alpine

# Installer wget pour health check
RUN apk add --no-cache wget

# Supprime la conf par défaut si besoin
RUN rm /etc/nginx/conf.d/default.conf || true

COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY ./html /usr/share/nginx/html

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
