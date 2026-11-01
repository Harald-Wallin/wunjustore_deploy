//PROMPT #7
import express from "express";
import { findServicePoints } from "../integrations/shippingAdapter.js";
import { getDeliveryEstimate } from "../services/shippingService.js";

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

router.get("/delivery-estimate", async (req, res) => {
    try {
        const estimate = await getDeliveryEstimate(
            req.query.method,
            req.query.postalCode
        );

        return res.json(estimate);
    } catch (error) {
        if (error.message === "POSTNORD_CONFIGURATION_ERROR") {
            console.error("PostNord origin postal code is not configured correctly:", error);
            return res.status(502).json({
                error: "Shipping service is not configured correctly"
            });
        }

        if (
            error.message === "INVALID_SHIPPING_METHOD"
            || error.message === "INVALID_POSTAL_CODE"
        ) {
            return res.status(400).json({
                error: "Invalid delivery estimate parameters"
            });
        }

        console.error("PostNord delivery estimate lookup failed:", error);
        return res.status(502).json({
            error: "Shipping service is temporarily unavailable"
        });
    }
});

export default router;
