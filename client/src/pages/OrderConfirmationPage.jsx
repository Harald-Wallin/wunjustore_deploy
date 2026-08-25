import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function OrderConfirmationPage() {

    //hämtar :orderId från url
    const { orderId } = useParams();

    //state
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        async function fetchOrder() {
            try {
                const response = await fetch(`http://localhost:3000/api/orders/${orderId}`);

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Could not fetch order");
                };

                setOrder(data.order);

            } catch (error){

                console.error("Failed to fetch order:",error);
                setError(error.message);
            }finally {
                setLoading(false);
            };
        };

        fetchOrder();

    }, [orderId]);//re-rendas alltså varje gång orderId ändras


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

            <h1>Thank you for your order!</h1>

            <div className="order-confirmation_info">

                <p> Order #{order.id}</p>
                <p>Customer: {order.customer.name}</p>
                <p>Email: {order.customer.email}</p>
            </div>

            <h2>Your beats</h2>

            <div className="order-confirmation_items">

                {order.items.map((currentItem) => (

                    <article key={currentItem.beatId} className="order-confirmation_item">

                        <img
                            className="order-confirmation_cover"
                            src={currentItem.albumCover}
                            alt={`Cover for ${currentItem.albumName}`}
                        />

                        <div className="order-confirmation_item-info">

                            <h3>{currentItem.beatName}</h3>
                            <p>{currentItem.albumName}</p>
                            <p>{currentItem.unitPrice.toFixed(2)} kr</p>
                        </div>
                    </article>

                ))}

            </div>


            <div className="order-confirmation_total">

                <strong>Total: {order.orderTotal.toFixed(2)} kr</strong>

            </div>


            <Link to="/albums">Continue browsing</Link>
        </section>
    );
};

export default OrderConfirmationPage;