import {useEffect, useState} from "react";
import {Link} from "react-router-dom";

import API_URL from "../config/api";

import {useUser} from "../context/UserContext.jsx";
import {useCurrency} from "../context/CurrencyContext";

function CustomerOrdersPage(){

    const {currentUser} = useUser();
    const {currency, convertPrice} = useCurrency();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() =>{

        //AbortController används för att avbryta ett "Web Request" när/där det behövs, så att gamla anrop inte
        //kan råka uppdatera state
        const controller = new AbortController();

        async function fetchOrders(){
            setLoading(true);
            setError(null);

            try{

                const response = await fetch(`${API_URL}/api/orders/me`, {
                    credentials: "include",
                    signal: controller.signal
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Could not fetch orders");
                };

                setOrders(data.orders);

            }catch (error){
                if (error.name !== "AbortError") {
                    console.error("Failed to fetch customer orders:",error);
                    setError(error.message);
                }

            } finally{

                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            };
        };

        fetchOrders();

        return () => controller.abort();

    }, [currentUser?.id]);


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

                                <p>Total: {convertPrice(currentOrder.orderTotal).toFixed(2)} {currency}</p>
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
