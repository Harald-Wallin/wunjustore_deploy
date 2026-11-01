import express from "express";
import { findServicePoints } from "../integrations/shippingAdapter.js";

const router = express.Router();

function normalizePostalCode(postalCode) {
    if (typeof postalCode !== "string") {
        return null;
    }

    const trimmedPostalCode = postalCode.trim();
    if (!/^\d{3}\s?\d{2}$/.test(trimmedPostalCode)) {
        return null;
    }

    return trimmedPostalCode.replace(/\s/g, "");
}

router.get("/service-points", async (req, res) => {
    const postalCode = normalizePostalCode(req.query.postalCode);

    if (!postalCode) {
        return res.status(400).json({
            error: "Invalid postal code"
        });
    }

    try {
        const servicePoints = await findServicePoints(postalCode);
        return res.json(servicePoints);
    } catch (error) {
        console.error("PostNord service point lookup failed:", error);

        return res.status(502).json({
            error: "Shipping service is temporarily unavailable"
        });
    }
});

export default router;
