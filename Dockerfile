# Build stage
# Pinned versions; Dependabot proposes updates.
FROM oven/bun:1.4.4-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

# Set placeholder values so they are baked into the compiled files and run build
RUN VITE_API_URL=PLACEHOLDER_VITE_API_URL \
    VITE_OIDC_AUTHORITY=PLACEHOLDER_VITE_OIDC_AUTHORITY \
    VITE_OIDC_CLIENT_ID=PLACEHOLDER_VITE_OIDC_CLIENT_ID \
    VITE_OIDC_REDIRECT_URI=PLACEHOLDER_VITE_OIDC_REDIRECT_URI \
    VITE_IMMICH_PROXY_URL=PLACEHOLDER_VITE_IMMICH_PROXY_URL \
    VITE_IMMICH_KIOSK_URL=PLACEHOLDER_VITE_IMMICH_KIOSK_URL \
    VITE_OPENOBSERVE_SITE=PLACEHOLDER_VITE_OPENOBSERVE_SITE \
    VITE_OPENOBSERVE_RUM_KEY=PLACEHOLDER_VITE_OPENOBSERVE_RUM_KEY \
    VITE_OPENOBSERVE_APP_ID=PLACEHOLDER_VITE_OPENOBSERVE_APP_ID \
    VITE_OPENOBSERVE_ORG=PLACEHOLDER_VITE_OPENOBSERVE_ORG \
    VITE_OPENOBSERVE_INSECURE_HTTP=PLACEHOLDER_VITE_OPENOBSERVE_INSECURE_HTTP \
    VITE_OPENOBSERVE_ENABLED=PLACEHOLDER_VITE_OPENOBSERVE_ENABLED \
    bun run build

# Production stage: nginx runs as the unprivileged user 101 and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.31-alpine
# entrypoint.sh fills in runtime values, so the user needs write access to these files.
COPY --from=builder --chown=101:101 /app/dist /usr/share/nginx/html
COPY --chown=101:101 nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=101:101 --chmod=0755 entrypoint.sh /entrypoint.sh

USER 101
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
