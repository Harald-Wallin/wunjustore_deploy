import {Outlet} from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { CheckoutShortcut } from "../components/CheckoutShortcut";



//CSS
import "../layout.css";

//En layout-komponent för alla sidors gemensamma grundstruktur.
//"<Outlet>" renderar den child-route som användaren befinner sig på

function AppLayout(){
    return(
        <div className="app-layout">

            <Header />
            <CheckoutShortcut />

            <main className="app-layout_main">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default AppLayout;