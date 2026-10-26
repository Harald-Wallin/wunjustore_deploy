import {Link} from "react-router-dom";
import {useCart} from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
//import mockAlbums from "../data/mockAlbums";

function CartPage(){

    //Importerar contexten från CartContext-lådan  
    const {cartItems,
        removeFromCart,
        totalPrice
    } = useCart();

    const {currency, convertPrice} = useCurrency();


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

                {cartItems.map((item) => (
                    /*Intern extra-return för att vi kör kod innuti map()*/
                    <article key={`${item.productType}-${item.productId}`} className="cart-item">
                        
                        {item.producType === "beat" ? (
                            <Link to={`/albums/${currentBeat.albumId}`} className="album-card_cover-link">
                                <img className="cart-item_image" src={currentBeat.albumCover} alt="Album Cover" />
                            </Link>

                        ):(
                            <img className ="cart-item_image" src ={item.image} alt={item.name} />
                        )}

                        <h2>{item.name}</h2>
                        {/*<p>{currentBeat.albumName}</p>*/}
                        <p className="cart-item_price">Price: {convertPrice(item.price).toFixed(2)} {currency}</p>

                        {item.productType === "merch" && (
                            <p>Quantity : {item.quantity}</p>
                        )}

                        <button type="button" 
                            onClick={()=> removeFromCart(item.productType, item.productId)}>
                            Remove
                        </button>
                    </article>
                ))};
            </div>

            {/*Totalbelopp + Checkout-länk. toFixed = konsant 2 decimaler*/}
            <div className="cart-total">
                <p>Total: {convertPrice(totalPrice).toFixed(2)} {currency}</p>

                <Link to="/checkout">
                    Checkout
                </Link>
            </div>
        </section>


    );
};

export default CartPage;