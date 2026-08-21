import {Link} from "react-router-dom";
import {useCart} from "../context/CartContext";

function CartPage(){

    //Importerar contexten från CartContext-lådan  
    const {cartItems,
        removeBeatFromCart,
        clearCart,
        totalPrice
    } = useCart();
    

    //Om tom så...
    if(cartItems.length===0){
        return(
            <section>
                <h1>Cart</h1>
                <p>Your cart is empty (for now..?)</p>
                <Link to = "/albums">
                    Browse music
                </Link>
            </section>
        );
    };

    return(
        <section>
            <h1>Cart</h1>
        </section>
    );
};

export default CartPage;