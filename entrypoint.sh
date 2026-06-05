#!/bin/sh
echo "Substituting environment variables in built JS files..."

for file in /usr/share/nginx/html/assets/*.js; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    sed -i "s|PLACEHOLDER_VITE_API_URL|${VITE_API_URL}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OIDC_AUTHORITY|${VITE_OIDC_AUTHORITY}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OIDC_CLIENT_ID|${VITE_OIDC_CLIENT_ID}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OIDC_REDIRECT_URI|${VITE_OIDC_REDIRECT_URI}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_IMMICH_PROXY_URL|${VITE_IMMICH_PROXY_URL}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_IMMICH_DROP_URL|${VITE_IMMICH_DROP_URL}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_IMMICH_KIOSK_URL|${VITE_IMMICH_KIOSK_URL}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OPENOBSERVE_SITE|${VITE_OPENOBSERVE_SITE}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OPENOBSERVE_CLIENT_TOKEN|${VITE_OPENOBSERVE_CLIENT_TOKEN}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OPENOBSERVE_APP_ID|${VITE_OPENOBSERVE_APP_ID}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OPENOBSERVE_ORG|${VITE_OPENOBSERVE_ORG}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OPENOBSERVE_INSECURE_HTTP|${VITE_OPENOBSERVE_INSECURE_HTTP}|g" "$file"
  fi
done

echo "Starting nginx..."
exec "$@"
