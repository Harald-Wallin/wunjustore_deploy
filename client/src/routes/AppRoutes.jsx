import {Route, Routes} from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

//Pages
import AboutPage from "../pages/AboutPage";
import BrowseMusicPage from "../pages/BrowseMusicPage";
import CartPage from "../pages/CartPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";

function AppRoutes(){
    return(
        <Routes>
            <Route element={<AppLayout />}>

                <Route path="/" element={<HomePage />} />

                <Route path="albums" element={<BrowseMusicPage />} />
 
                <Route path="about" element={<AboutPage />} />
 
                <Route path ="cart" element={<CartPage />} />

                <Route path ="login" element={<LoginPage />} />

                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;