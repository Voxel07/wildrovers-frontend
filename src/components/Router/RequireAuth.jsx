import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../../context/useAuth";

const RequireAuth = ({ allowedRoles }) => {
    const { auth, ready } = useAuth();
    const location = useLocation();

    // The session is loaded from the backend on start; decide only once it is known.
    if (!ready) return null;

    return (
        allowedRoles?.includes(auth.roles)
            ? <Outlet />
            : auth.isAuthenticated
                ? <Navigate to="/unauthorized" state={{ from: location }} replace />
                : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;
