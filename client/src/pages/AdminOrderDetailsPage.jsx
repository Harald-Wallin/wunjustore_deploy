import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API_URL from "../config/api";

function AdminOrderDetailsPage() {

    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {

        async function fetchOrder() {

            try {
                const response = await fetch(`${API_URL}/api/orders/${orderId}`);

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Could not fetch order");
                };

                setOrder(data.order);

            } catch(error){

                console.error("Failed to fetch order:",error);
                setError(error.message);

            } finally{
                setLoading(false);
            };
        };

        fetchOrder();

    }, [orderId]);


    if (loading){
        return (
            <section>
                <h1>Loading order...</h1>
            </section>
        );
    };


    if (error || !order){
        return(
            <section>
                <h1>Order not found</h1>
                <p>{error}</p>
            </section>
        );
    };


    return(
        <section className="admin-order-details-page">

            <button type="button"
                onClick={() => navigate("/admin/orders")}>
                Back to Orders
            </button>

            <h1>Order #{order.id}</h1>

            <p>Created:{" "}{new Date(order.createdAt).toLocaleString()}</p>


            <div className="order-customer">

                <h2>Customer</h2>
                <p>Name: {order.customer.name}</p>
                <p>Email: {order.customer.email}</p>
            </div>

            <h2>Purchased Beats</h2>

            <div className="order-items">
                {order.items.map((currentItem) => (

                    <article key={currentItem.beatId}className="order-item">

                        <img className="order-item-cover" src={currentItem.albumCover}
                            alt={currentItem.albumName}
                        />


                        <div className="order-item-info">
                            <h3>{currentItem.beatName}</h3>
                            <p>{currentItem.albumName}</p>
                        </div>

                        <p className="order-item-price">
                            {currentItem.unitPrice.toFixed(2)} kr
                        </p>

                    </article>

                ))}

            </div>


            <div className="order-total">

                <h2>Total: {order.orderTotal.toFixed(2)} kr</h2>
            </div>
        </section>
    );
};

export default AdminOrderDetailsPage;