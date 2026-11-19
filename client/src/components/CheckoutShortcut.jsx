import {Link} from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLocation } from "react-router-dom";

export function CheckoutShortcut(){

    const {cartItems} = useCart();
    const location = useLocation();

    const hideShortcut = location.pathname === "/cart";

    if (cartItems.length === 0 || hideShortcut){
        return null;
    }

    return(
        <div>
            <Link to="/checkout" className="checkout-shortcut">Checkout</Link>
        </div>
    );
}



