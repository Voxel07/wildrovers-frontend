#!/bin/sh
set -eu

echo "Substituting environment variables in built JS files..."

CSP_FRAME_SOURCES="${CSP_FRAME_SOURCES}"
if ! printf '%s' "$CSP_FRAME_SOURCES" | grep -Eq '^https://[A-Za-z0-9._:-]+( https://[A-Za-z0-9._:-]+)*$'; then
  echo "Invalid CSP_FRAME_SOURCES. Use space-separated HTTPS origins without paths." >&2
  exit 1
fi
sed -i "s|PLACEHOLDER_CSP_FRAME_SOURCES|${CSP_FRAME_SOURCES}|g" /etc/nginx/conf.d/default.conf

# The page only talks to the API and (optionally) OpenObserve; logins with Authentik
# are full-page redirects and the backend exchanges the tokens.
origin_of() {
  printf '%s' "$1" | sed -E 's#^(https?://[^/]+).*$#\1#'
}
CSP_CONNECT_SOURCES="$(origin_of "${VITE_API_URL:-}")"
if [ "${VITE_OPENOBSERVE_ENABLED:-true}" != "false" ] && [ -n "${VITE_OPENOBSERVE_SITE:-}" ]; then
  if [ "${VITE_OPENOBSERVE_INSECURE_HTTP:-false}" = "true" ]; then
    OO_ORIGIN="http://${VITE_OPENOBSERVE_SITE}"
  else
    OO_ORIGIN="https://${VITE_OPENOBSERVE_SITE}"
  fi
  CSP_CONNECT_SOURCES="${CSP_CONNECT_SOURCES} $(origin_of "$OO_ORIGIN")"
fi
CSP_CONNECT_SOURCES="$(printf '%s' "$CSP_CONNECT_SOURCES" | sed -E 's/^ +| +$//g')"
if ! printf '%s' "$CSP_CONNECT_SOURCES" | grep -Eq '^(https?://[A-Za-z0-9._:-]+)( https?://[A-Za-z0-9._:-]+)*$'; then
  echo "Invalid CSP connect sources '${CSP_CONNECT_SOURCES}'. Check VITE_API_URL and VITE_OPENOBSERVE_SITE." >&2
  exit 1
fi
sed -i "s|PLACEHOLDER_CSP_CONNECT_SOURCES|${CSP_CONNECT_SOURCES}|g" /etc/nginx/conf.d/default.conf

for file in /usr/share/nginx/html/assets/*.js; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    sed -i "s|PLACEHOLDER_VITE_API_URL|${VITE_API_URL}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OIDC_AUTHORITY|${VITE_OIDC_AUTHORITY}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OIDC_CLIENT_ID|${VITE_OIDC_CLIENT_ID}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OIDC_REDIRECT_URI|${VITE_OIDC_REDIRECT_URI}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_IMMICH_PROXY_URL|${VITE_IMMICH_PROXY_URL}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_IMMICH_KIOSK_URL|${VITE_IMMICH_KIOSK_URL}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OPENOBSERVE_SITE|${VITE_OPENOBSERVE_SITE}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OPENOBSERVE_RUM_KEY|${VITE_OPENOBSERVE_RUM_KEY}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OPENOBSERVE_APP_ID|${VITE_OPENOBSERVE_APP_ID}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OPENOBSERVE_ORG|${VITE_OPENOBSERVE_ORG}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OPENOBSERVE_INSECURE_HTTP|${VITE_OPENOBSERVE_INSECURE_HTTP}|g" "$file"
    sed -i "s|PLACEHOLDER_VITE_OPENOBSERVE_ENABLED|${VITE_OPENOBSERVE_ENABLED}|g" "$file"
  fi
done

echo "Starting nginx..."
exec "$@"
