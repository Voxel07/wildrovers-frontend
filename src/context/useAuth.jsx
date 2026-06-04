import { use } from "react";
import AuthContext from "../context/AuthProvider";

const useAuth = () => {
    return use(AuthContext);
}

export default useAuth;