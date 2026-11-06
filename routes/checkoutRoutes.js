import express from "express";
import { startCheckout } from "../services/checkoutService.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
    try {

        //tidigare skickade klienten även userId utöver cart och shippingselection.
        //Nu tas userID från req.body som authentiseras av requireAuth-middlewaren
        const {cartItems, shippingSelection} = req.body ?? {}; //Från klient
        const checkout = await startCheckout(req.userId, cartItems, shippingSelection); //userId från req

        res.status(201).json(checkout);

    } catch (error) {
        console.error("Failed to start checkout:", error);

        if (error.message === "INVALID_CART") {
            return res.status(400).json({
                error: "Invalid cart"
            });
        }

        if (error.message === "INSUFFICIENT_STOCK"){
            return res.status(409).json({
                error: "Insufficient stock"
            });
        }

        if (
            error.message === "INVALID_SHIPPING_METHOD"
            || error.message === "INVALID_POSTAL_CODE"
            || error.message === "INVALID_SERVICE_POINT"
        ) {
            return res.status(400).json({
                error: "Invalid shipping selection"
            });
        }

        res.status(500).json({
            error: "Failed to start checkout"
        })
    }
});

export default router;