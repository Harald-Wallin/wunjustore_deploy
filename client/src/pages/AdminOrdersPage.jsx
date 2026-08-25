import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API_URL from "../config/api";

function AdminOrdersPage() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {

        async function fetchOrders() {
            try {

                const response = await fetch(`${API_URL}/api/orders`);

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Could not fetch orders");
                }

                setOrders(data.orders);

            } catch (error) {

                console.error("Failed to fetch orders:",error);
                setError(error.message);

            } finally{
                setLoading(false);
            }
        };

        fetchOrders();

    }, []);


    if (loading) {
        return (
            <section>
                <h1>Orders</h1>
                <p>Loading orders...</p>
            </section>
        );
    };


    if (error) {
        return (
            <section>
                <h1>Orders</h1>
                <p>{error}</p>
            </section>
        );
    };


    return (
        <section className="admin-orders-page">

            <h1>Orders</h1>

            {orders.length === 0 ?(<p>No orders yet.</p>): 
            (
                <div className="admin-orders-list">

                    {orders.map((currentOrder) => (

                        <article key={currentOrder.id} className="admin-order-row">

                            <div className="admin-orders-details">
                                <h2> Order #{currentOrder.id}</h2>

                                <p>Customer: {currentOrder.userName}</p>

                                <p>Email: {currentOrder.userEmail}</p>

                                <p>Total: {currentOrder.orderTotal.toFixed(2)} kr</p>

                                {/*gör om SQL-strängen till JS-objektet Date och förenklar läsbarheten*/}
                                <p>Created: {new Date(currentOrder.createdAt).toLocaleString()}</p>
                            </div>


                            <Link to={`/admin/orders/${currentOrder.id}`}>
                                View order
                            </Link>
                        </article>

                    ))}

                </div>
            )}

        </section>
    );
};

export default AdminOrdersPage;