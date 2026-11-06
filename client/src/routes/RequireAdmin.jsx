import {Navigate, Outlet}  from "react-router-dom";
import {useUser} from "../context/UserContext.jsx";

function RequireAdmin(){

    const {currentUser, authLoading} = useUser();

    if (authLoading){

        return <p>Checking authentication...</p>;
    }

    if (!currentUser){

        return <Navigate to="/login" replace />;
    }

    if(currentUser.role !== "admin"){
        
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default RequireAdmin;
