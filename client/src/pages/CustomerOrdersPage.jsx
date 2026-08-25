import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useUser } from "../context/UserContext.jsx";

function CustomerOrdersPage() {
    const { currentUser } = useUser();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() =>{
        async function fetchOrders() {
            try {
                const response = await fetch(`http://localhost:3000/api/orders/user/${currentUser.id}`);

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Could not fetch orders");
                };

                setOrders(data.orders);

            }catch (error){
                console.error("Failed to fetch customer orders:",error);
                setError(error.message);

            } finally {
                setLoading(false);
            };
        };

        fetchOrders();

    }, [currentUser.id]);


    if (loading) {
        return (
            <section>
                <h1>My Orders</h1>
                <p>Loading orders...</p>
            </section>
        );
    };


    if (error){
        return (
            <section>
                <h1>My Orders</h1>
                <p>{error}</p>
            </section>
        );
    };


    return(
        <section className="customer-orders-page">

            <h1>My Orders</h1>


            {orders.length === 0 ? (<p>You have no orders yet.</p>): 
            (
                <div className="customer-orders-list">

                    {orders.map((currentOrder) => (
                        <article key={currentOrder.id} className="customer-order-row">

                            <div>
                                <h2>Order #{currentOrder.id}</h2>

                                <p>Total: {currentOrder.orderTotal.toFixed(2)} kr</p>
                                <p>{new Date(currentOrder.createdAt).toLocaleString()}</p>
                            </div>


                            <Link to={`/account/orders/${currentOrder.id}`}>
                                View order
                            </Link>
                        </article>
                    ))}

                </div>
            )}

        </section>
    );
};

export default CustomerOrdersPage;