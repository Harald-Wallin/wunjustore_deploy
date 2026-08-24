import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";

function RequireAdmin() {
    const { currentUser } = useUser();

    if (!currentUser) {
        return <Navigate to="/login" replace />;;
    }

    if (currentUser.role !== "admin") {
         return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default RequireAdmin;