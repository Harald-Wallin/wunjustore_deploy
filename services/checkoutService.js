import { createOrder, cancelOrder} from "./orderService.js";
import { createCheckoutSession } from "./stripeService.js";
import pool from "../database/db.js";

async function startCheckout(userId, cartItems) {

    //Skapar ordern + reservera item
    const order = await createOrder(userId, cartItems);

    let session;

    try {
        //skapa en session > Stripe
        session = await createCheckoutSession(order);

    }catch(error){

        //ingen session > återställ lager och order
        try{
            await cancelOrder(order.id);

        }catch (cancelError) {
            console.error("Failed to cancel order:", cancelError)
        }

        console.error("Stripe session creation failed:", error);
        throw error;
    }

    //Koppla Stripe-sessionen till order
    await pool.query(`
        UPDATE orders
        SET stripe_session_id = $1
        WHERE id = $2;
    `, [session.id, order.id]);

    //returnera information till frontend
    return{
        orderId: order.id,
        clientSecret: session.client_secret
    };
}

export { startCheckout };