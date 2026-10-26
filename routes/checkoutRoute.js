import express from "express";
import { startCheckout } from "../services/checkoutService.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {

        const {userId, cartItems} = req.body;
        const checkout = await startCheckout(userId, cartItems);

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

        res.status(500).json({
            error: "Failed to start checkout"
        })
    }
});

export default router;