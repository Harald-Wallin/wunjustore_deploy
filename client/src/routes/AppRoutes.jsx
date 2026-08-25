import {Route, Routes} from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

//Allmänna Pages
import AboutPage from "../pages/AboutPage";
import BrowseMusicPage from "../pages/BrowseMusicPage";
import CartPage from "../pages/CartPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import CheckoutPage from "../pages/CheckOutPage";
import OrderConfirmationPage from "../pages/OrderConfirmationPage";
import TrackListPage from "../pages/TrackListPage";

//Kund-pages
import CustomerOrderDetailsPage from "../pages/CustomerOrderDetailsPage";
import CustomerOrdersPage from "../pages/CustomerOrdersPage";
import ProfilePage from "../pages/ProfilePage";

//admin-pages
import AdminAlbumsPage from "../pages/AdminAlbumsPage";
import AdminOrderDetailsPage from "../pages/AdminOrderDetailsPage";
import CreateAlbumPage from "../pages/CreateAlbumPage";
import EditBeatPage from "../pages/EditBeatPage";
import AdminOrdersPage from "../pages/AdminOrdersPage";
import CreateBeatPage from "../pages/CreateBeatPage";
import AlbumEditorPage from "../pages/AlbumEditorPage";

//user state
import RequireAdmin from "./RequireAdmin";
import RequireAuth from "./RequireAuth";


function AppRoutes(){
    return(
        <Routes>
            <Route element={<AppLayout />}>

                {/*Allmänna*/}
                <Route path="/" element={<HomePage />} />
                <Route path="*" element={<NotFoundPage />} />
                <Route path ="login" element={<LoginPage />} />
                <Route path="albums" element={<BrowseMusicPage />} />
                <Route path="albums/:albumId" element={<TrackListPage />}/>
                <Route path="about" element={<AboutPage />} />
                <Route path ="cart" element={<CartPage />} />

                {/*Logged in*/}
                <Route element={<RequireAuth />}>
                    <Route path ="checkout" element={<CheckoutPage />} />
                    <Route path= "orders/:orderId/confirmation" element= {<OrderConfirmationPage />}/>
                    <Route path="account/profile" element={<ProfilePage />} />
                    <Route path="account/orders" element={<CustomerOrdersPage />} />
                    <Route path="account/orders/:orderId" element={<CustomerOrderDetailsPage />} />
                </Route>

                {/*Admin */}
                <Route element = {<RequireAdmin />}>
                    <Route path="admin/albums" element={<AdminAlbumsPage />} />
                    <Route path="admin/albums/new" element={<CreateAlbumPage />} />
                    <Route path="admin/albums/:albumId/edit" element={<AlbumEditorPage />} />
                    <Route path="admin/beats/new" element={<CreateBeatPage />} />
                    <Route path="admin/beats/:beatId/edit" element={<EditBeatPage />} />
                    <Route path="admin/orders" element={<AdminOrdersPage />} />
                    <Route path="admin/orders/:orderId" element={<AdminOrderDetailsPage />} />
                </Route>

            </Route>
        </Routes>
    );
};

export default AppRoutes;