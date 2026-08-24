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
                    <div>
                        <li><NavLink to="/cart">Cart</NavLink></li>

                        <li><NavLink to="/login">Login</NavLink></li>
                    </div>
                )};

                {/*Customer.. */}
                {currentUser?.role === "customer" && (
                    <div>
                        <li><NavLink to="/cart">Cart</NavLink></li>

                        <li><NavLink to="/account/profile">My account</NavLink></li>

                        <li><span className="navbar-userstate">User</span></li>

                        <li><button type= "button" onClick={handleLogout}>Logout</button></li>
                    </div>
                )};

                {/*Admin.. */}
                {currentUser?.role === "admin" &&(
                    <div>
                        <li><NavLink to="/admin/albums">Manage Albums</NavLink></li>

                        <li><NavLink to="/admin/orders">ORders</NavLink></li>

                        <li><span className="navbar-userstate">Admin</span></li>

                        <li><button type= "button" onClick={handleLogout}>Logout</button></li>
                    </div>
                )};
 

            </ul>
        </nav>
    );
};

export default Navbar;