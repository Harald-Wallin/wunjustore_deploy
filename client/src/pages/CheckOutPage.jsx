import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useCart } from "../context/CartContext";

function CheckoutPage() {

    const {
        cartItems,
        totalPrice,
        clearCart
    } = useCart();

    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);


    async function handlePlaceOrder() {

        try {
            setIsSubmitting(true);
            setError(null);

            //plockar ur beat.id så att endast denna data skickas till order (inget överflöd)
            const beatIds = cartItems.map(
                (currentBeat) => currentBeat.id
            );


            const response = await fetch(
                "http://localhost:3000/api/orders",
                {
                    method: "POST",

                    headers: {"Content-Type": "application/json"},

                    body: JSON.stringify({
                        userId: 1,
                        beatIds: beatIds
                    })
                }
            );

            const data = await response.json();

            if (!response.ok){
                throw new Error(
                    data.message || "Could not create order"
                );
            }

            const orderId = data.order.id;

            clearCart();
            //Navigate, som Link fast lotsar vidare användaren automatiskt
            navigate(`/orders/${orderId}/confirmation`);

        } catch (error){
            console.error("Failed to place order:",error);
            setError(error.message);

        } finally {
            setIsSubmitting(false);
        }
    }


    if (cartItems.length === 0) {
        return (
            <section>
                <h1>Checkout</h1>

                <p>Your cart is empty.</p>

                <Link to="/albums">
                    Browse music
                </Link>
            </section>
        );
    }


    return (
        <section>
            <h1>Checkout</h1>

            <div className="checkout-items">

                {cartItems.map((currentBeat) => (
                    <article key={currentBeat.id} className="checkout-item">
                        <img
                            src={currentBeat.albumCover}
                            alt={`Cover for ${currentBeat.albumName}`}
                        />

                        <div>
                            <h2>{currentBeat.beatName}</h2>
                            <p>{currentBeat.albumName}</p>
                            <p>Price: {currentBeat.beatPrice.toFixed(2)} kr</p>
                        </div>
                    </article>
                ))};
            </div>


            <div className="checkout-total">

                <p>Total: {totalPrice.toFixed(2)} kr</p>
            </div>

            {error && (<p>{error}</p>)}

            {/*Lite UX som FAKTISKT fångar eventuellt fel: att kunden spam-klickar innan servern
            hinner svara och lägger flera identiska ordrar förhindras när knappen disable'as!!*/}
            <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Placing order..." : "Place order"}
            </button>

        </section>
    );
};

export default CheckoutPage;