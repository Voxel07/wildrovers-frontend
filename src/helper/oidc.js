// Authentik login, browser half. The browser only runs the authorization request
// (PKCE + state); the backend exchanges the code and keeps every token.

// RFC 7636 §4.1: the verifier must be 43–128 characters from the unreserved set.
// 32 random bytes, base64url-encoded without padding, yield exactly 43 characters.
function randomString() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return base64urlencode(bytes);
}

function base64urlencode(a) {
  let str = "";
  const bytes = new Uint8Array(a);
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generateCodeChallenge(verifier) {
  const hashed = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64urlencode(hashed);
}

const getOidcConfig = () => {
  const authority = import.meta.env.VITE_OIDC_AUTHORITY || 'http://localhost:9000/application/o/wildrovers/';
  let origin = 'http://localhost:9000';
  try {
    origin = new URL(authority).origin;
  } catch (e) {
    console.error("Invalid OIDC authority URL", e);
  }
  return {
    clientId: import.meta.env.VITE_OIDC_CLIENT_ID || 'wildrovers-backend',
    redirectUri: import.meta.env.VITE_OIDC_REDIRECT_URI || 'http://localhost:5173/Login',
    authorizeUrl: `${origin}/application/o/authorize/`,
  };
};

// sessionStorage: the values only have to survive the redirect in this tab.
const VERIFIER_KEY = "oidc_verifier";
const STATE_KEY = "oidc_state";
const RETURN_KEY = "oidc_return_to";

/** Redirects to Authentik; `returnTo` is where the user lands after login. */
export async function redirectToAuthentik(returnTo = "/") {
  const config = getOidcConfig();
  const verifier = randomString();
  const state = randomString();
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(RETURN_KEY, returnTo);

  const url = new URL(config.authorizeUrl);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", config.clientId);
  url.searchParams.append("redirect_uri", config.redirectUri);
  url.searchParams.append("scope", "openid profile email offline_access");
  url.searchParams.append("code_challenge", await generateCodeChallenge(verifier));
  url.searchParams.append("code_challenge_method", "S256");
  url.searchParams.append("state", state);

  window.location.href = url.toString();
}

/**
 * Takes the PKCE verifier for a returned authorization code, once. Returns null when
 * no login is pending or the returned state does not match the one sent (forged or
 * replayed callback).
 */
export function consumeOidcCallback(returnedState) {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  const expectedState = sessionStorage.getItem(STATE_KEY);
  const returnTo = sessionStorage.getItem(RETURN_KEY) || "/";
  // Single use, also against the double effect run of React Strict Mode.
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(RETURN_KEY);
  if (!verifier || !expectedState || returnedState !== expectedState) {
    return null;
  }
  return { verifier, returnTo };
}

/** True while an Authentik login started in this tab is waiting for its callback. */
export function hasPendingOidcLogin() {
  return sessionStorage.getItem(VERIFIER_KEY) !== null;
}
