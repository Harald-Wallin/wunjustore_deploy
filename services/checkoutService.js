import { createOrder, cancelOrder, validateCart} from "./orderService.js";
import { createCheckoutSession, expireCheckoutSession } from "./stripeService.js";
import { validateShippingSelection } from "./shippingService.js";
import pool from "../database/db.js";

async function startCheckout(userId, cartItems, shippingSelection) {
    const validatedCartItems = validateCart(cartItems);
    const containsMerch = validatedCartItems.some((item) => item.productType === "merch");

    let validatedShippingSelection = null;

    if (containsMerch) {
        validatedShippingSelection = await validateShippingSelection(
            shippingSelection?.method,
            shippingSelection?.postalCode,
            shippingSelection?.servicePointId
        );
    }


    //Skapar ordern + reservera item
    const order = await createOrder(userId, validatedCartItems, validatedShippingSelection);

    let session;

    try {
        //skapa en session > Stripe
        session = await createCheckoutSession(order);

    } catch(error) {

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
    try {
        const linkResult = await pool.query(`
            UPDATE orders
            SET stripe_session_id = $1
            WHERE id = $2;
        `, [session.id, order.id]);

        if (linkResult.rowCount !== 1) {
            throw new Error("ORDER_NOT_LINKED_TO_STRIPE_SESSION");
        }
    } catch (error) {
        console.error("Failed to link Stripe session to order:", error);

        try {
            await expireCheckoutSession(session.id);
            await cancelOrder(order.id, session.id);
        } catch (cleanupError) {
            console.error("Failed to safely clean up Stripe session:", cleanupError);
        }

        throw error;
    }

    //returnera information till frontend
    return{
        orderId: order.id,
        clientSecret: session.client_secret
    };
}

export { startCheckout };