import {Link} from "react-router-dom";
import {useCart} from "../context/CartContext";
//import mockAlbums from "../data/mockAlbums";

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
            <div className="cart-list">

                {cartItems.map((currentBeat) => (
                    /*Intern extra-return för att vi kör kod innuti map()*/
                    <article key={currentBeat.id} className="cart-item">

                        <img className="cart-item_image" src={currentBeat.albumCover} alt="Album Cover" />
                        <h2>{currentBeat.beatName}</h2>
                        <p>{currentBeat.albumName}</p>
                        <p className="cart-item_price">Price:{currentBeat.beatPrice.toFixed(2)} kr</p>

                        <button type="button" 
                            onClick={()=> removeBeatFromCart(currentBeat.id)}>
                            Remove
                        </button>
                    </article>
                ))};
            </div>

            {/*Totalbelopp + Checkout-länk. toFixed = konsant 2 decimaler*/}
            <div className="cart-total">
                <p>Total: {totalPrice.toFixed(2)} kr</p>

                <Link to="/checkout">
                    Checkout
                </Link>
            </div>
        </section>


    );
};

export default CartPage;