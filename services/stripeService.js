import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(order){
    const subtotalInCents = Math.round(order.subtotal * 100);
    const shippingPriceInCents = Math.round(order.shippingPrice * 100);
    const orderTotalInCents = Math.round(order.orderTotal * 100);

    if (
        !Number.isFinite(subtotalInCents)
        || !Number.isFinite(shippingPriceInCents)
        || !Number.isFinite(orderTotalInCents)
        || subtotalInCents < 0
        || shippingPriceInCents < 0
        || orderTotalInCents < 0
        || subtotalInCents + shippingPriceInCents !== orderTotalInCents
    ) {
        throw new Error("INVALID_ORDER_TOTAL");
    }

    const lineItems = [
        {
            price_data:{
                currency: "sek",
                product_data: {
                    name:`Products for order #${order.id}`
                },
                unit_amount: subtotalInCents
            },
            quantity: 1
        }
    ];

    if (shippingPriceInCents > 0) {
        lineItems.push({
            price_data:{
                currency: "sek",
                product_data: {
                    name: "Shipping"
                },
                unit_amount: shippingPriceInCents
            },
            quantity: 1
        });
    }
    
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        ui_mode:"embedded_page",
        line_items: lineItems,

        client_reference_id: String(order.id),

        //Dit kunden skickas efter checkout. Stripe ersätter  {CHECKOUT_SESSION_ID}
        return_url:`${process.env.CLIENT_URL}/orders/${order.id}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        redirect_on_completion: "always",
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60 //30 minuter

    },{
        idempotencyKey: `checkout-order-${order.id}`//Förhindrar oavsiktliga dubbel-sessions för betalningar
    });

    return session;
}

async function expireCheckoutSession(sessionId) {
    return stripe.checkout.sessions.expire(sessionId);
}

export { stripe, createCheckoutSession, expireCheckoutSession };