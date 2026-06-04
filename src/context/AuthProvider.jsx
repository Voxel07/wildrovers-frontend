import { createContext, useState, useEffect, useRef } from "react";
import { refreshAccessToken, parseJwt } from "../helper/oidc";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuthState] = useState(() => {
        try {
            const storedAuth = localStorage.getItem("auth");
            return storedAuth ? JSON.parse(storedAuth) : {};
        } catch (e) {
            console.error("Error reading auth from localStorage", e);
            return {};
        }
    });

    const refreshTimerRef = useRef(null);

    const setAuth = (newAuth) => {
        setAuthState((prev) => {
            const updated = typeof newAuth === 'function' ? newAuth(prev) : newAuth;
            try {
                if (updated && updated.JWT) {
                    localStorage.setItem("auth", JSON.stringify(updated));
                } else {
                    localStorage.removeItem("auth");
                }
            } catch (e) {
                console.error("Error writing auth to localStorage", e);
            }
            return updated;
        });
    };

    // Proactive token refresh: schedule a refresh 60s before expiry
    useEffect(() => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }

        if (!auth || !auth.JWT || !auth.refreshToken || !auth.expiresAt) return;

        const msUntilExpiry = auth.expiresAt - Date.now();
        // Refresh 60 seconds before expiry, or immediately if < 60s remain
        const msUntilRefresh = Math.max(0, msUntilExpiry - 60 * 1000);

        refreshTimerRef.current = setTimeout(async () => {
            try {
                const tokens = await refreshAccessToken(auth.refreshToken);
                const payload = parseJwt(tokens.access_token || tokens.id_token);
                const updatedAuth = {
                    ...auth,
                    JWT: tokens.access_token,
                    refreshToken: tokens.refresh_token || auth.refreshToken,
                    expiresAt: tokens.expires_in
                        ? Date.now() + tokens.expires_in * 1000
                        : null,
                    user: payload?.preferred_username || auth.user,
                    roles: auth.roles,
                };
                setAuth(updatedAuth);
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
    }, [auth?.expiresAt, auth?.refreshToken]);

    // Sync auth state from other tabs
    useEffect(() => {
        const handleAuthUpdate = () => {
            try {
                const storedAuth = localStorage.getItem("auth");
                setAuthState(storedAuth ? JSON.parse(storedAuth) : {});
            } catch (e) {
                console.error("Error reading auth from localStorage in event", e);
            }
        };
        window.addEventListener("auth-updated", handleAuthUpdate);
        window.addEventListener("storage", handleAuthUpdate);
        return () => {
            window.removeEventListener("auth-updated", handleAuthUpdate);
            window.removeEventListener("storage", handleAuthUpdate);
        };
    }, []);

    return (
        <AuthContext value={{ auth, setAuth }}>
            {children}
        </AuthContext>
    );
};

export default AuthContext;