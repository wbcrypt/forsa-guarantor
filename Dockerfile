# ─── FORSA Frontend Dockerfile (used by all React portals) ───────────────────
# Build args: VITE_API_URL — backend URL baked into the static build
#             VITE_TENANT_ID — some portals (student/university/partner) have
#             no tenant field on their login form and hardcode a fallback UUID
#             that only matches whatever tenant existed on the original
#             developer's machine — never the real bootstrap tenant on a fresh
#             deployment. Pass the real tenant ID here so login actually works.
ARG VITE_API_URL=http://localhost:3000
ARG VITE_TENANT_ID=""

FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_API_URL
ARG VITE_TENANT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TENANT_ID=$VITE_TENANT_ID

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ─── Production: serve with nginx ────────────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA config: all routes → index.html
COPY <<'NGINX_CONF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # No cache for HTML
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
NGINX_CONF

EXPOSE 80
