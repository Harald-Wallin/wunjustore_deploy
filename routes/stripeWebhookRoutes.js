import express from "express";
import { stripe } from "../services/stripeService.js";
import { markOrderAsPaid, cancelOrder } from "../services/orderService.js";

const router = express.Router();

//.raw = datan behandlas som rå data ist för JSON
router.post("/", express.raw({ type: "application/json" }), async (req, res) => {

    const signature = req.headers["stripe-signature"];

    let event;

    try {

        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );

    } catch (error){

        console.error("Invalid Stripe webhook:", error.message);
        return res.status(400).send("Invalid webhook signature");
    }

    try{
        if (event.type === "checkout.session.completed"){
            const session = event.data.object;

            if(session.payment_intent_status === "paid"){
                const orderId = Number(session.client_reference_id);
                await markOrderAsPaid(orderId, session.id);
            }

        } else if (event.type === "checkout.session.expired"){

            const session = event.data.object;
            const orderId = Number (session.client_reference_id);

            await cancelOrder(orderId, session.id);
        }

        res.sendStatus(200);

    }catch (error){

        console.error("Webhook processing failed:", error)
        res.sendStatus(500);

    }
});

export default router;