import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import API_URL from "../config/api";

import { useCurrency } from "../context/CurrencyContext";
import { useCart } from "../context/CartContext";

function OrderConfirmationPage() {

    //hämtar :orderId från url
    const { orderId } = useParams();
    const {currency, convertPrice} = useCurrency();
    const { clearCart } = useCart();

    //state
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        let intervalId;
        async function fetchOrder() {
            try {
                const response = await fetch(`${API_URL}/api/orders/${orderId}`);

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Could not fetch order");
                };

                setOrder(data.order);
                setError(null);

                if (data.order.status !== "pending"){
                    clearInterval(intervalId);
                }

            } catch (error){

                console.error("Failed to fetch order:",error);
                setError(error.message);
            }finally {
                setLoading(false);
            };
        };

        fetchOrder();

        intervalId = setInterval(fetchOrder, 3000);
        return () => clearInterval(intervalId);

    }, [orderId]);//re-rendas alltså varje gång orderId ändras

    //rensar kundkorgen vid lyckat genomfört köp
    useEffect(() => {

        if (order?.status === "paid") {
            clearCart();
        }

    }, [order?.status]);


    //loading
    if (loading) {
        return (
            <section>
                <h1>Loading order...</h1>
            </section>
        );
    };


    //error
    if (error) {
        return (
            <section>
                <h1>Could not load order</h1>

                <p>{error}</p>
                <Link to="/albums">Back to music</Link>
            </section>
        );
    };


    return (
        <section className="order-confirmation">

            <h1>
                {order.status === "paid" ? "Thank you for buying stuff at WUNJU!"
                    : order.status === "pending" ? "Waiting for your payment confirmation..." 
                    : "Order cancelled ):"}
            </h1>

            <div className="order-confirmation_info">

                <p> Order #{order.id}</p>
                <p>Payment status : {order.status}</p>
                <p>Customer: {order.customer.name}</p>
                <p>Email: {order.customer.email}</p>
            </div>

            <h2>Your items</h2>

            <div className="order-confirmation_items">

                {order.items.map((currentItem, index) => (

                    <article key={index} className="order-confirmation_item">

                        {currentItem.productType === "beat" ? (

                            <>
                                <img
                                    className="order-confirmation_cover"
                                    src={currentItem.albumCover}
                                    alt={`Cover for ${currentItem.albumName}`}
                                />

                                <div className="order-confirmation_item-info">

                                    <h3>{currentItem.beatName}</h3>
                                    <p>{currentItem.albumName}</p>
                                    <p>{convertPrice(currentItem.unitPrice).toFixed(2)} {currency}</p>

                                </div>
                            </>

                        ):(

                            <div className="order-confirmation_item-info">

                                <h3>{currentItem.productName}</h3>
                                <p>Quantity: {currentItem.quantity}</p>
                                <p>{convertPrice(currentItem.unitPrice).toFixed(2)} {currency} each</p>

                            </div>

                        )}

                    </article>
                ))}

            </div>


            <div className="order-confirmation_total">

                <strong>Total: {convertPrice(order.orderTotal).toFixed(2)} {currency}</strong>

            </div>


            <Link to="/albums">Continue browsing</Link>
        </section>
    );
};

export default OrderConfirmationPage;