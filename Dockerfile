# Build stage
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

# Set placeholder values so they are baked into the compiled files
ENV VITE_API_URL=PLACEHOLDER_VITE_API_URL
ENV VITE_OIDC_AUTHORITY=PLACEHOLDER_VITE_OIDC_AUTHORITY
ENV VITE_OIDC_CLIENT_ID=PLACEHOLDER_VITE_OIDC_CLIENT_ID
ENV VITE_OIDC_REDIRECT_URI=PLACEHOLDER_VITE_OIDC_REDIRECT_URI
ENV VITE_IMMICH_PROXY_URL=PLACEHOLDER_VITE_IMMICH_PROXY_URL
ENV VITE_IMMICH_DROP_URL=PLACEHOLDER_VITE_IMMICH_DROP_URL
ENV VITE_IMMICH_KIOSK_URL=PLACEHOLDER_VITE_IMMICH_KIOSK_URL

RUN bun run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
