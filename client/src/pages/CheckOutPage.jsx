import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

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
    const [postalCode, setPostalCode] = useState("");
    const [shippingMethod, setShippingMethod] = useState("service_point");
    const [servicePoints, setServicePoints] = useState([]);
    const [servicePointsKey, setServicePointsKey] = useState("");
    const [servicePointId, setServicePointId] = useState("");
    const [servicePointSelectionKey, setServicePointSelectionKey] = useState("");
    const [shippingLoading, setShippingLoading] = useState(false);
    const [shippingError, setShippingError] = useState(null);
    const [estimate, setEstimate] = useState(null);
    const [estimateKey, setEstimateKey] = useState("");
    const [estimateLoading, setEstimateLoading] = useState(false);
    const [estimateError, setEstimateError] = useState(null);

    const hasMerch = useMemo(
        () => cartItems.some((item) => item.productType === "merch"),
        [cartItems]
    );
    const normalizedPostalCode = postalCode.trim().replace(/\s/g, "");
    const validPostalCode = /^\d{5}$/.test(normalizedPostalCode);
    const shippingSelectionKey = `${normalizedPostalCode}:${shippingMethod}`;
    const selectedServicePointId = servicePointSelectionKey === shippingSelectionKey
        ? servicePointId
        : "";
    const visibleServicePoints = servicePointsKey === shippingSelectionKey
        ? servicePoints
        : [];
    const visibleEstimate = estimateKey === shippingSelectionKey ? estimate : null;
    const showShippingLoading = shippingMethod === "service_point" && shippingLoading;
    const showShippingError = shippingMethod === "service_point" ? shippingError : null;
    const shippingPrice = hasMerch && totalPrice < 500
        ? shippingMethod === "service_point" ? 59 : 99
        : 0;
    const shippingSelectionIsValid = !hasMerch
    || (
        validPostalCode
        && (
            shippingMethod === "home_delivery"
            || (
                !shippingLoading
                && servicePointsKey === shippingSelectionKey
                && visibleServicePoints.some(
                    (point) => point.id === selectedServicePointId
                )
            )
        )
    );

    useEffect(() => {
        if (!hasMerch || !validPostalCode || clientSecret) {
            return undefined;
        }

        const controller = new AbortController();
        let active = true;

        async function fetchShippingData() {
            setShippingLoading(true);
            setShippingError(null);

            try {
                const response = await fetch(
                    `${API_URL}/api/shipping/service-points?postalCode=${normalizedPostalCode}`,
                    {signal: controller.signal}
                );

                if (!response.ok) {
                    throw new Error("Could not load service points");
                }

                const data = await response.json();
                if (active) {
                    setServicePoints(Array.isArray(data) ? data : []);
                    setServicePointsKey(shippingSelectionKey);
                }
            } catch (fetchError) {
                if (fetchError.name !== "AbortError" && active) {
                    setServicePoints([]);
                    setShippingError(fetchError.message);
                }
            } finally {
                if (active) {
                    setShippingLoading(false);
                }
            }
        }

        if (shippingMethod === "service_point") {
            fetchShippingData();
        }

        return () => {
            active = false;
            controller.abort();
        };
    }, [clientSecret, hasMerch, normalizedPostalCode, shippingMethod, shippingSelectionKey, validPostalCode]);

    useEffect(() => {
        if (!hasMerch || !validPostalCode || clientSecret) {
            return undefined;
        }

        const controller = new AbortController();
        let active = true;

        async function fetchEstimate() {
            setEstimateLoading(true);
            setEstimateError(null);

            try {
                const response = await fetch(
                    `${API_URL}/api/shipping/delivery-estimate?method=${shippingMethod}&postalCode=${normalizedPostalCode}`,
                    {signal: controller.signal}
                );

                if (!response.ok) {
                    throw new Error("Could not load delivery estimate");
                }

                const data = await response.json();
                if (active) {
                    setEstimate(data);
                    setEstimateKey(shippingSelectionKey);
                }
            } catch (fetchError) {
                if (fetchError.name !== "AbortError" && active) {
                    setEstimate(null);
                    setEstimateError(fetchError.message);
                }
            } finally {
                if (active) {
                    setEstimateLoading(false);
                }
            }
        }

        fetchEstimate();

        return () => {
            active = false;
            controller.abort();
        };
    }, [clientSecret, hasMerch, normalizedPostalCode, shippingMethod, shippingSelectionKey, validPostalCode]);

    function handlePostalCodeChange(event) {
        setPostalCode(event.target.value);
        setServicePointId("");
        setServicePointSelectionKey("");
    }

    function handleShippingMethodChange(method) {
        setShippingMethod(method);
        setServicePointId("");
        setServicePointSelectionKey("");
    }

    async function handlePlaceOrder() {
        if (!shippingSelectionIsValid || clientSecret) {
            return;
        }

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
                    cartItems: checkoutItems,
                    ...(hasMerch && {
                        shippingSelection: {
                            method: shippingMethod,
                            postalCode: normalizedPostalCode,
                            servicePointId: shippingMethod === "service_point"
                                ? selectedServicePointId
                                : null
                        }
                    })
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
                <p>Products: {convertPrice(totalPrice).toFixed(2)} {currency}</p>
                <p>Shipping: {convertPrice(shippingPrice).toFixed(2)} {currency}</p>
                <p>Total including shipping: {convertPrice(totalPrice + shippingPrice).toFixed(2)} {currency}</p>
            </div>

            {hasMerch && !clientSecret && (
                <section className="checkout-shipping">
                    <h2>Delivery</h2>

                    <label>
                        Postal code
                        <input
                            type="text"
                            value={postalCode}
                            onChange={handlePostalCodeChange}
                            placeholder="633 54"
                            inputMode="numeric"
                            disabled={Boolean(clientSecret)}
                        />
                    </label>

                    {validPostalCode && (
                        <>
                            <fieldset>
                                <legend>Delivery method</legend>
                                <label>
                                    <input
                                        type="radio"
                                        name="shipping-method"
                                        value="service_point"
                                        checked={shippingMethod === "service_point"}
                                        onChange={() => handleShippingMethodChange("service_point")}
                                        disabled={Boolean(clientSecret)}
                                    />
                                    PostNord Service Point ({convertPrice(totalPrice >= 500 ? 0 : 59).toFixed(2)} {currency})
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="shipping-method"
                                        value="home_delivery"
                                        checked={shippingMethod === "home_delivery"}
                                        onChange={() => handleShippingMethodChange("home_delivery")}
                                        disabled={Boolean(clientSecret)}
                                    />
                                    Home Delivery ({convertPrice(totalPrice >= 500 ? 0 : 99).toFixed(2)} {currency})
                                </label>
                            </fieldset>

                            {totalPrice >= 500 && <p>Free shipping</p>}

                            {shippingMethod === "service_point" && (
                                <label>
                                    Service point
                                    <select
                                        value={servicePointId}
                                        onChange={(event) => {
                                            setServicePointId(event.target.value);
                                            setServicePointSelectionKey(shippingSelectionKey);
                                        }}
                                        disabled={showShippingLoading || Boolean(clientSecret)}
                                    >
                                        <option value="">Select a service point</option>
                                        {visibleServicePoints.map((point) => (
                                            <option key={point.id} value={point.id}>
                                                {point.name} - {point.address}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            )}

                            {showShippingLoading && <p>Loading service points...</p>}
                            {showShippingError && <p>{showShippingError}</p>}
                            {estimateLoading && <p>Loading delivery estimate...</p>}
                            {estimateError && <p>{estimateError}</p>}
                            {!estimateLoading && !estimateError && (
                                <p>
                                    Estimated delivery:{" "}
                                    {visibleEstimate?.estimatedDeliveryDate || "No delivery estimate available"}
                                </p>
                            )}
                        </>
                    )}
                </section>
            )}

            {error && (<p>{error}</p>)}

            {clientSecret ? (
                <EmbeddedCheckoutProvider stripe = {stripePromise} options = {{clientSecret}}>
                    <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
            ):(
                <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || !shippingSelectionIsValid}
                >
                    {isSubmitting ? "Starting Checkout" : "Proceed to payment"}
                </button>
            )}

        </section>
    );
};

export default CheckoutPage;