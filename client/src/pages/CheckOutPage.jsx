import { Link } from "react-router-dom";
import { useState } from "react";

import API_URL from "../config/api";

import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { useCurrency } from "../context/CurrencyContext";

//Stripe (sdk)
import {EmbeddedCheckoutProvider, EmbeddedCheckout} from "@stripe/react-stripe-js";

import {stripePromise} from "../stripe";

function CheckoutPage() {

    const {
        cartItems,
        totalPrice,
    } = useCart();

    const {currentUser} = useUser();
    const {currency, convertPrice} = useCurrency();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);

    async function handlePlaceOrder() {
        try {
            setIsSubmitting(true);
            setError(null);

            //anpassa varukorgen till backendendformat (zod, orderrader)
            const checkoutItems = cartItems.map((item) => ({
                productType: item.productType,
                productId: item.productId,
                quantity: item.quantity
            }));

            //anropa egen Express-backend
            const response = await fetch(`${API_URL}/api/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    cartItems: checkoutItems
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not start checkout");
            }

            //Spara resultatfrån backend
            setClientSecret(data.clientSecret);

        } catch (error) {
            console.error("Failed to start checkout:", error);
            setError(error.message);

        } finally {
            setIsSubmitting(false);
        }
    }


    //måste vara inloggad som customer
    if (!currentUser){
        return(
            <section>
                <h1>Checkout</h1>

                <p>You need to be logged in as a customer to place an order</p>
                <Link to="/albums">Back to music</Link>
            </section>
        );
    }

    if (cartItems.length === 0) {
        return (
            <section>
                <h1>Checkout</h1>

                <p>Your cart is empty</p>

                <Link to="/albums">
                    Browse music
                </Link>
            </section>
        );
    };


    return (
        <section>
            <h1>Checkout</h1>

            <div className="checkout-items">

                {cartItems.map((item) => (

                    <article key={`${item.productType}-${item.productId}`} className="checkout-item">

                        <img src={item.image} alt={item.name}/>

                        <div>
                            <h2>{item.name}</h2>

                            {item.productType === "beat" && (<p>{item.albumName}</p>)}

                            {item.productType === "merch" && (<p>Quantity: {item.quantity}</p>)}

                            <p>Price: {convertPrice(item.price * item.quantity).toFixed(2)} {currency}</p>
                        </div>

                    </article>
                ))}
            </div>


            <div className="checkout-total">

                <p>Total: {convertPrice(totalPrice).toFixed(2)} {currency}</p>
            </div>

            {error && (<p>{error}</p>)}

            {clientSecret ? (
                <EmbeddedCheckoutProvider stripe = {stripePromise} options = {{clientSecret}}>
                    <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
            ):(
                <button type = "button" onClick = {handlePlaceOrder} disabled = {isSubmitting}>
                    {isSubmitting ? "Starting Checkout" : "Proceed to payment"}
                </button>
            )}

        </section>
    );
};

export default CheckoutPage;