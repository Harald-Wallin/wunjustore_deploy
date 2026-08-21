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

            {/*Själva varukorgslistan*/}
            <div classname="cart-list">
                {cartItems.map((currentBeat) => (
                    <article key={currentBeat.id} className="cart-item">
                        <h2>{currentBeat.beatName}</h2>
                        <p>{currentBeat.beatPrice} kr</p>

                        <button type="button" 
                            onClick={()=> removeBeatFromCart(currentBeat.id)}>
                            Remove
                        </button>
                    </article>
                ))}
            </div>

            {/*Totalbelopp + Checkout-länk*/}
            <div className="cart-total">
                <p>Total: {totalPrice} kr</p>

                <Link to="/checkout">
                    Checkout
                </Link>
            </div>
        </section>


    );
};

export default CartPage;