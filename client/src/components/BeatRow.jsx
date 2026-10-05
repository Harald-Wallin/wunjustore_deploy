import {useCart} from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";

function BeatRow({beat}){

    const {cartItems, addBeatToCart} = useCart();
    const {currency, convertPrice} = useCurrency();

    const convertedPrice = convertPrice(beat.beatPrice);

    //Variabel som håller beats som redan finns i kundkorgen
    const beatAlreadyInCart = cartItems.some(
        (currentBeat) => currentBeat.id === beat.id
    );


    return(
        <article className="beat-row">

            <div className="beat-row_info">
                <h3>{beat.beatName}</h3>
            </div>

            <div className="beat-row_actions">

                <audio controls preload="none" className="preview-player">
                    <source src={beat.previewUrl} type="audio/wav" />
                    Your browser does not support audio playback ):
                </audio>

                <p><strong>Price: {convertedPrice.toFixed(2)} {currency}</strong></p>

                {/*Lade till lite UX- om 'beatAlreadyInCart' > visa "in cart" */}
                <button type="button" onClick ={()=> addBeatToCart(beat)}
                    disabled = {beatAlreadyInCart}>
                    {beatAlreadyInCart ? "In cart" : "Add to cart"}
                </button>
            </div>

        </article>
    );
};

export default BeatRow;