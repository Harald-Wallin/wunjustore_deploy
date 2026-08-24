import {Link} from "react-router-dom";
import Navbar from "./Navbar";

//Generell header-komponent med Navbar-komponenten inbakad i sig, men
//också en länk till "hemsidan" i form av en logga (snart)
function Header(){

    return(
        <header className="site-header">
            <div className="site-header_div">

                <Link to="/" className="site-header_logo">
                    WUNJU
                </Link>
                
                <Navbar />

            </div>
        </header>
    );
};

export default Header;