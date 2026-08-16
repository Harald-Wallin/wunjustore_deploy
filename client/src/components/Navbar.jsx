import {NavLink} from "react-router-dom";

// Navigationskomponent till "sidorna" Home, BrowseMusic, About, Cart och Login
//Jag använder NavLink (ej "link") för att senare kunna MARKERA vilken sida som användaren står på just nu.
// UX!

function NavBar(){
    return(
        <nav aria-label="Main navigation">
            <ul className="navbar_list">
                
                <li>
                    <NavLink to="/">Home</NavLink>
                </li>

                <li>
                    <Navlink to="/albums">Browse Music</Navlink>
                </li>

                <li>
                    <Navlink to="/about">About</Navlink>
                </li>

                <li>
                    <Navlink to="/cart">Cart</Navlink>
                </li>

                <li>
                    <Navlink to="/Login">Login</Navlink>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;