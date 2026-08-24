import {Link} from "react-router-dom";
import Navbar from "./Navbar";
import { useUser } from "../context/UserContext";

//Generell header-komponent med Navbar-komponenten inbakad i sig, men
//också en länk till "hemsidan" i form av en logga (snart)
function Header(){
    const{currentUser, selectUser} = useUser();
    
    function handleUserChange(event){
        selectUser(event.target.value);
    };

    return(
        <header className="site-header">
            <div className="site-header_div">

                <Link to="/" className="site-header_logo">
                    WUNJU
                </Link>
                
                <Navbar />

                {/*userState-dropdownmeny */}
                <div className="userSelector">

                    {/*om currentUser.role inte finns > visitor */}
                    <select value={currentUser?.role == "visitor"}
                        onChange={handleUserChange}>
                    
                        <option value ="visitor"> Visitor </option>
                        <option value = "customer"> Customer</option>
                        <option value ="admin"> Admin </option>

                    </select>

                    {currentUser && (<p> {currentUser.name}</p>)};

                </div>
            </div>
        </header>
    );
};

export default Header;