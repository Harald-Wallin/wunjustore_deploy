import {Navigate, Outlet}  from "react-router-dom";
import {useUser} from "../context/UserContext.jsx";

function RequireAuth(){

    const {currentUser, authLoading} = useUser();

    if (authLoading){

        return <p>Checking authentication...</p>;
    }

    if (!currentUser){

        return <Navigate to="/login" replace />;
    }

    //outlet = rendera den childroute som matchade
    return <Outlet />;
}

export default RequireAuth;
