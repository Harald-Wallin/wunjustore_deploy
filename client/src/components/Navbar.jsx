import {NavLink} from "react-router-dom";

// Navigationskomponent till "sidorna" Home, BrowseMusic, About, Cart och Login
//Jag använder NavLink (ej "link") för att senare kunna MARKERA vilken sida som användaren står på just nu.
// UX!

function Navbar(){
    return(
        <nav aria-label="Main navigation">
            <ul className="navbar_list">
                
                <li>
                    <NavLink to="/">Home</NavLink>
                </li>

                <li>
                    <NavLink to="/albums">Browse Music</NavLink>
                </li>

                <li>
                    <NavLink to="/about">About</NavLink>
                </li>

                <li>
                    <NavLink to="/cart">Cart</NavLink>
                </li>

                <li>
                    <NavLink to="/login">Login</NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;