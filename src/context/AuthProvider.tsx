import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { isAxiosError } from "axios";
import { setTelemetryUser } from "../helper/telemetry";
import api, { apiUrl, isTransientAuthError, markSessionRestored, refreshSession, rememberSession, type SessionInfo } from "../helper/api";
import SessionExpiredDialog from "../components/utils/SessionExpiredDialog";

/** Who is logged in, as components read it. */
export interface AuthState {
    isAuthenticated: boolean;
    user: string | null;
    userId: number | null;
    roles: string | null;
    canCreateCategory: boolean;
    photoUrl: string | null;
    oidcLinked: boolean;
}

export interface AuthContextValue {
    auth: AuthState;
    /** True once the initial session check has finished. */
    ready: boolean;
    /** Login and logout: also tells the other open tabs. */
    setSession: (session: SessionInfo | null) => void;
    reloadSession: () => Promise<void>;
    logout: (options?: { everywhere?: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const ANONYMOUS: AuthState = Object.freeze({
    isAuthenticated: false,
    user: null,
    userId: null,
    roles: null,
    canCreateCategory: false,
    photoUrl: null,
    oidcLinked: false,
});

/** Maps the backend session JSON to the auth state components read. */
function fromSession(session: SessionInfo | null | undefined): AuthState {
    if (!session?.authenticated) return ANONYMOUS;
    return {
        isAuthenticated: true,
        user: session.userName ?? null,
        userId: session.userId ?? null,
        roles: session.role ?? null,
        canCreateCategory: !!session.canCreateCategory,
        photoUrl: apiUrl(session.photoUrl) ?? null,
        oidcLinked: !!session.oidcLinked,
    };
}

// Re-read the session (role, block status) this often and whenever the tab becomes visible.
const SESSION_CHECK_MS = 5 * 60 * 1000;
// On page load an unreachable backend is retried a few times before showing the visitor view.
const INITIAL_LOAD_RETRIES_MS = [1000, 3000];

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Tokens live in HttpOnly cookies; this state only holds who is logged in.
    const [auth, setAuthState] = useState<AuthState>(ANONYMOUS);
    const [ready, setReady] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);

    // Keeps the same object when nothing changed, so pages that depend on `auth`
    // do not reload their data on every periodic session check.
    const applySession = useCallback((session: SessionInfo | null | undefined) => {
        const next = fromSession(session);
        const keys = Object.keys(next) as Array<keyof AuthState>;
        setAuthState((prev) => (keys.every((k) => prev[k] === next[k]) ? prev : next));
    }, []);

    /** Login and logout: also tells the other open tabs. */
    const setSession = useCallback((session: SessionInfo | null) => {
        rememberSession(session, { broadcast: true });
        applySession(session);
    }, [applySession]);

    const fetchSession = useCallback(async () => {
        let data: SessionInfo | null = null;
        try {
            ({ data } = await api.get<SessionInfo>('/auth/session'));
        } catch (err) {
            // 401: the access cookie is stale or was rejected. The refresh cookie may still be valid.
            if (!isAxiosError(err) || err.response?.status !== 401) throw err;
        }
        if (data?.authenticated) {
            rememberSession(data);
            applySession(data);
            return;
        }
        // No valid access cookie: a refresh cookie may still exist (it is HttpOnly, so ask).
        const refreshed = await refreshSession();
        applySession(refreshed);
    }, [applySession]);

    const loadSession = useCallback(async () => {
        try {
            await fetchSession();
        } catch (err) {
            // Offline or backend unavailable: keep the session, the next check retries.
            if (!isTransientAuthError(err)) setSession(null);
        }
    }, [fetchSession, setSession]);

    const logout = useCallback(async ({ everywhere = false }: { everywhere?: boolean } = {}) => {
        try {
            await api.post('/auth/logout', null, { params: everywhere ? { all: true } : undefined, _skipAuthRetry: true });
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            setSession(null);
        }
    }, [setSession]);

    useEffect(() => {
        // Sessions before the HttpOnly cookies kept tokens in a script-readable cookie; remove it.
        document.cookie = 'auth:v1=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure';
        let cancelled = false;
        (async () => {
            for (let attempt = 0; ; attempt++) {
                try {
                    await fetchSession();
                    break;
                } catch (err) {
                    if (!isTransientAuthError(err) || attempt >= INITIAL_LOAD_RETRIES_MS.length) {
                        if (!cancelled && !isTransientAuthError(err)) setSession(null);
                        break;
                    }
                    await wait(INITIAL_LOAD_RETRIES_MS[attempt]);
                    if (cancelled) return;
                }
            }
            // Requests held back in api.js go out now, with the restored cookies (or as a visitor).
            markSessionRestored();
            if (!cancelled) setReady(true);
        })();
        return () => { cancelled = true; };
    }, [fetchSession, setSession]);

    // Refreshes triggered by the API layer (expiry, 401) update the state here.
    useEffect(() => {
        const onSession = (e: Event) => applySession((e as CustomEvent<SessionInfo>).detail);
        const onExpired = () => setSessionExpired(true);
        window.addEventListener('auth-session', onSession);
        window.addEventListener('auth-expired', onExpired);
        return () => {
            window.removeEventListener('auth-session', onSession);
            window.removeEventListener('auth-expired', onExpired);
        };
    }, [applySession]);

    useEffect(() => {
        if (!auth.isAuthenticated) return;
        const interval = setInterval(loadSession, SESSION_CHECK_MS);
        const onVisible = () => {
            if (document.visibilityState === 'visible') loadSession();
        };
        document.addEventListener('visibilitychange', onVisible);
        // A check that failed while offline is repeated as soon as the connection is back.
        window.addEventListener('online', loadSession);
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('online', loadSession);
        };
    }, [auth.isAuthenticated, loadSession]);

    useEffect(() => {
        if (auth.user) {
            setTelemetryUser({ id: String(auth.userId ?? auth.user), name: auth.user });
        }
    }, [auth.user, auth.userId]);

    const value = useMemo<AuthContextValue>(
        () => ({ auth, ready, setSession, reloadSession: loadSession, logout }),
        [auth, ready, setSession, loadSession, logout]
    );

    return (
        <AuthContext value={value}>
            {children}
            <SessionExpiredDialog
                open={sessionExpired && !auth.isAuthenticated}
                onClose={() => setSessionExpired(false)}
            />
        </AuthContext>
    );
};

export default AuthContext;
