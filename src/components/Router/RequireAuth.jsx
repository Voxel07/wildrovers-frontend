import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../../context/useAuth";

const RequireAuth = ({ allowedRoles }) => {
    const { auth } = useAuth();
    const location = useLocation();

    console.log(auth)
    console.log(allowedRoles)

    return (
        auth?.roles == allowedRoles
            ? <Outlet />
            : auth?.user
                ? <Navigate to="/unauthorized" state={{ from: location }} replace />
                : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;