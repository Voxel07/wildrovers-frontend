// OIDC Client Helper for Authentik

// Generate random string for code verifier
function dec2hex(dec) {
  return dec.toString(16).padStart(2, "0");
}

export function generateCodeVerifier() {
  const array = new Uint32Array(56 / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec2hex).join("");
}

// Generate SHA-256 hash of verifier
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

// Base64url encode the hash buffer
function base64urlencode(a) {
  let str = "";
  const bytes = new Uint8Array(a);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Generate code challenge from verifier
export async function generateCodeChallenge(v) {
  const hashed = await sha256(v);
  return base64urlencode(hashed);
}

// Get OIDC configuration from environment
const getOidcConfig = () => {
  const authority = import.meta.env.VITE_OIDC_AUTHORITY || 'http://localhost:9000/application/o/wildrovers/';
  let origin = 'http://localhost:9000';
  try {
    origin = new URL(authority).origin;
  } catch (e) {
    console.error("Invalid OIDC authority URL", e);
  }
  return {
    authority,
    clientId: import.meta.env.VITE_OIDC_CLIENT_ID || 'wildrovers-backend',
    redirectUri: import.meta.env.VITE_OIDC_REDIRECT_URI || 'http://localhost:5173/Login',
    authorizeUrl: `${origin}/application/o/authorize/`,
    tokenUrl: `${origin}/application/o/token/`,
  };
};

// Redirect user to Authentik OIDC login page
export async function redirectToAuthentik() {
  const config = getOidcConfig();
  const verifier = generateCodeVerifier();
  
  // Save verifier locally to exchange later
  localStorage.setItem("oidc_verifier", verifier);
  
  const challenge = await generateCodeChallenge(verifier);
  
  const url = new URL(config.authorizeUrl);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", config.clientId);
  url.searchParams.append("redirect_uri", config.redirectUri);
  url.searchParams.append("scope", "openid profile email offline_access");
  url.searchParams.append("code_challenge", challenge);
  url.searchParams.append("code_challenge_method", "S256");
  
  // Optional: add state to protect against CSRF
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem("oidc_state", state);
  url.searchParams.append("state", state);

  window.location.href = url.toString();
}

// Exchange code for token
export async function exchangeCodeForToken(code) {
  const config = getOidcConfig();
  const verifier = localStorage.getItem("oidc_verifier");
  
  if (!verifier) {
    return null;
  }

  // Clear verifier immediately to prevent double exchange in React Strict Mode
  localStorage.removeItem("oidc_verifier");
  localStorage.removeItem("oidc_state");

  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("client_id", config.clientId);
  params.append("code", code);
  params.append("redirect_uri", config.redirectUri);
  params.append("code_verifier", verifier);

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Token exchange failed: ${errText}`);
  }

  return await response.json();
}

// Parse JWT claims
export function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch (e) {
    return null;
  }
}

// Refresh access token using refresh token
export async function refreshAccessToken(refreshToken) {
  const config = getOidcConfig();
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("client_id", config.clientId);
  params.append("refresh_token", refreshToken);

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Token refresh failed: ${errText}`);
  }

  return await response.json();
}
