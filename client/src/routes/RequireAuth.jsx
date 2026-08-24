import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";

function RequireAuth() {
    const { currentUser } = useUser();

    if (!currentUser) {return <Navigate to="/login" replace />;}

    //outlet = remndera den childroute som matchade
    return <Outlet />;
}

export default RequireAuth;