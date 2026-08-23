import {useCart} from "../context/CartContext";

function BeatRow({beat}){

    const {cartItems, addBeatToCart} = useCart();

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
                    Your browser does not support audio playback.
                </audio>

                <p>Price: {beat.beatPrice.toFixed(2)}</p>

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