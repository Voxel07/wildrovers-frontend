/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_OIDC_AUTHORITY?: string;
  readonly VITE_OIDC_CLIENT_ID?: string;
  readonly VITE_OIDC_REDIRECT_URI?: string;
  readonly VITE_IMMICH_PROXY_URL?: string;
  readonly VITE_IMMICH_KIOSK_URL?: string;
  readonly VITE_OPENOBSERVE_ENABLED?: string;
  readonly VITE_OPENOBSERVE_SITE?: string;
  readonly VITE_OPENOBSERVE_RUM_KEY?: string;
  readonly VITE_OPENOBSERVE_APP_ID?: string;
  readonly VITE_OPENOBSERVE_ORG?: string;
  readonly VITE_OPENOBSERVE_INSECURE_HTTP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
