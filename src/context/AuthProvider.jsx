import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { refreshTokens, parseJwt } from "../helper/oidc";
import { getCookie, setCookie, deleteCookie } from "../helper/cookies";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuthState] = useState(() => {
        try {
            const storedAuth = getCookie("auth:v1");
            return storedAuth ? JSON.parse(storedAuth) : {};
        } catch (e) {
            console.error("Error reading auth from cookie", e);
            return {};
        }
    });

    const refreshTimerRef = useRef(null);

    const setAuth = useCallback((newAuth) => {
        setAuthState((prev) => {
            const updated = typeof newAuth === 'function' ? newAuth(prev) : newAuth;
            try {
                if (updated && updated.JWT) {
                    setCookie("auth:v1", JSON.stringify(updated), 7);
                } else {
                    deleteCookie("auth:v1");
                }
            } catch (e) {
                console.error("Error writing auth to cookie", e);
            }
            return updated;
        });
    }, []);

    const { JWT, refreshToken, expiresAt } = auth || {};

    // Proactive token refresh: schedule a refresh 60s before expiry
    useEffect(() => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }

        if (!JWT || !refreshToken || !expiresAt) return;

        const msUntilExpiry = expiresAt - Date.now();
        // Refresh 60 seconds before expiry, or immediately if < 60s remain
        const msUntilRefresh = Math.max(0, msUntilExpiry - 60 * 1000);

        refreshTimerRef.current = setTimeout(async () => {
            try {
                const tokens = await refreshTokens(refreshToken);
                const payload = parseJwt(tokens.access_token || tokens.id_token);
                setAuth((prev) => ({
                    ...prev,
                    JWT: tokens.access_token,
                    refreshToken: tokens.refresh_token || prev.refreshToken,
                    expiresAt: tokens.expires_in
                        ? Date.now() + tokens.expires_in * 1000
                        : null,
                    user: payload?.preferred_username || prev.user,
                    roles: prev.roles,
                }));
                window.dispatchEvent(new Event("auth-updated"));
            } catch (err) {
                console.error("Proactive token refresh failed", err);
                // Token refresh failed — clear auth to force re-login
                setAuth({});
                window.dispatchEvent(new Event("auth-updated"));
            }
        }, msUntilRefresh);

        return () => {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
            }
        };
    }, [JWT, refreshToken, expiresAt, setAuth]);

    // Sync auth state from other tabs
    useEffect(() => {
        const handleAuthUpdate = () => {
            try {
                const storedAuth = getCookie("auth:v1");
                setAuthState(storedAuth ? JSON.parse(storedAuth) : {});
            } catch (e) {
                console.error("Error reading auth from cookie in event", e);
            }
        };
        window.addEventListener("auth-updated", handleAuthUpdate);
        return () => {
            window.removeEventListener("auth-updated", handleAuthUpdate);
        };
    }, []);

    return (
        <AuthContext value={{ auth, setAuth }}>
            {children}
        </AuthContext>
    );
};

export default AuthContext;