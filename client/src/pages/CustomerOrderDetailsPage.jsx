import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function CustomerOrderDetailsPage() {

    const { orderId } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() =>{

        async function fetchOrder() {
            try {

                const response = await fetch(`${API_URL}/api/orders/${orderId}`);

                const data = await response.json();


                if (!response.ok) {
                    throw new Error(data.message || "Could not fetch order");
                };

                setOrder(data.order);

            } catch (error){

                console.error("Failed to fetch customer order:",error);
                setError(error.message);
            } finally{
                setLoading(false);
            };
        };

        fetchOrder();

    }, [orderId]);


    if (loading) {
        return (
            <section>
                <h1>Loading order...</h1>
            </section>
        );
    }


    if (error || !order) {
        return (
            <section>
                <h1>Order not found</h1>

                <p>{error}</p>

                <Link to="/account/orders">
                    Back to My Orders
                </Link>
            </section>
        );
    };


    return (
        <section className="customer-order-details-page">

            <Link to="/account/orders">
                Back to My Orders
            </Link>

            <h1>Order #{order.id}</h1>

            <p>Created:{" "}{new Date(order.createdAt).toLocaleString()}</p>

            <div className="customer-order-items">

                <h2>Purchased Beats</h2>

                {order.items.map((currentItem) => (

                    <article key={currentItem.beatId} className="customer-order-item">

                        <img className="customer-order-item_cover" src={currentItem.albumCover}
                            alt={`Cover for ${currentItem.albumName}`}  
                        />

                        <div className="customer-order-item_info">

                            <h3>{currentItem.beatName}</h3>
                            <p>{currentItem.albumName}</p>
                            <p>{currentItem.unitPrice.toFixed(2)} kr</p>
                        </div>
                    </article>
                ))}
            </div>


            <div className="customer-order-total">
                <h2>Total: {order.orderTotal.toFixed(2)} kr</h2>
            </div>

        </section>
    );
};

export default CustomerOrderDetailsPage;