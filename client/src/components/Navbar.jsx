import {NavLink} from "react-router-dom";
import { useUser } from "../context/UserContext";

// Navigationskomponent till "sidorna" Home, BrowseMusic, About, Cart och Login
//Jag använder NavLink (ej "link") för att senare kunna MARKERA vilken sida som användaren står på just nu.
// UX!

function Navbar(){

    const{currentUser, selectUser} = useUser();

    //Om man loggar ut återgår userState till visitor
    function handleLogout(){
        selectUser("visitor")
    };

    return(
        <nav aria-label="Main navigation">
            <ul className="navbar_list">
                
                <li><NavLink to="/">Home</NavLink></li>

                <li><NavLink to="/albums">Browse Music</NavLink></li>

                <li><NavLink to="/about">About</NavLink></li>


                {/*Visitor...*/}
                {!currentUser && (
                    <>
                        <li><NavLink to="/cart">Cart</NavLink></li>

                        <li><NavLink to="/login">Login</NavLink></li>
                    </>
                )}

                {/*Customer.. */}
                {currentUser?.role === "customer" && (
                    <>{/*"< fraktioner(?) för att inte påverka css-parent" */}

                        <li><NavLink to="/cart">Cart</NavLink></li>

                        <li><NavLink to="/account/profile">My account</NavLink></li>

                        <li><span className="navbar-userstate">User</span></li>

                        <li><button type= "button" onClick={handleLogout}>Logout</button></li>
                    </>
                )}

                {/*Admin.. */}
                {currentUser?.role === "admin" &&(
                    <>
                        <li><NavLink to="/admin/albums">Manage Albums</NavLink></li>

                        <li><NavLink to="/admin/orders">ORders</NavLink></li>

                        <li><span className="navbar-userstate">Admin</span></li>

                        <li><button type= "button" onClick={handleLogout}>Logout</button></li>
                    </>
                )}
 

            </ul>
        </nav>
    );
};

export default Navbar;