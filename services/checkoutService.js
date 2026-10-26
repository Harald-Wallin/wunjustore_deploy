import { createOrder} from "./orderService.js";
import { createCheckoutSession } from "./stripeService.js";
import pool from "../database/db.js";

async function startCheckout(userId, cartItems) {

    //Skapar ordern + reservera item
    const order = await createOrder(userId, cartItems);

    try {
        //skapa en session > Stripe
        const session = await createCheckoutSession(order);

        //Koppla Stripe-sessionen till order
        await pool.query(`
            UPDATE orders
            SET stripe_session_id = $1
            WHERE id = $2;
        `, [session.id, order.id]);

        //returnera information till frontend
        return {
            orderId: order.id,
            clientSecret: session.client_secret
        };

    } catch (error) {
        console.error("Checkout failed:", error)
        throw error;
    }
}

export { startCheckout };