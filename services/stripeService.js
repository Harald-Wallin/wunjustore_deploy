import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(order){
    
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        ui_mode:"embedded_page",
        line_items: [
            {
                price_data:{
                    currency: "sek",
                    product_data: {
                        name:`Order #${order.id}`
                    },

                    unit_amount: Math.round(order.orderTotal * 100)
                },

                quantity: 1
            }
        ],

        client_reference_id: String(order.id),

        //Dit kunden skickas efter checkout. Stripe ersätter  {CHECKOUT_SESSION_ID}
        return_url:`${process.env.FRONTEND_URL}/orders/${order.id}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        redirect_on_completion: "always",
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60 //30 minuter

    },{
        idempotencyKey: `checkout-order-${order.id}`//Förhindrar oavsiktliga dubbel-sessions för betalningar
    });

    return session;
}

export { stripe, createCheckoutSession };