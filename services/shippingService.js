//PROMPT #3, #4, #5, #6
import { findServicePoints } from "../integrations/shippingAdapter.js";

const shippingMethods = Object.freeze({
    service_point: 59,
    home_delivery: 99
});

const FREE_SHIPPING_THRESHOLD = 500;

function validateSubtotal(subtotal) {
    if (typeof subtotal !== "number" || !Number.isFinite(subtotal) || subtotal < 0) {
        throw new Error("INVALID_SUBTOTAL");
    }
}

function calculateShippingPrice(method, subtotal) {
    if (shippingMethods[method] === undefined) {
        throw new Error("INVALID_SHIPPING_METHOD");
    }

    validateSubtotal(subtotal);

    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingMethods[method];
}

function normalizePostalCode(postalCode) {
    if (typeof postalCode !== "string") {
        throw new Error("INVALID_POSTAL_CODE");
    }

    const trimmedPostalCode = postalCode.trim();
    if (!/^\d{3}\s?\d{2}$/.test(trimmedPostalCode)) {
        throw new Error("INVALID_POSTAL_CODE");
    }

    return trimmedPostalCode.replace(/\s/g, "");
}

async function validateShippingSelection(method, postalCode, servicePointId) {
    if (shippingMethods[method] === undefined) {
        throw new Error("INVALID_SHIPPING_METHOD");
    }

    const normalizedPostalCode = normalizePostalCode(postalCode);

    if (method === "home_delivery") {
        return {
            method,
            postalCode: normalizedPostalCode,
            servicePoint: null
        };
    }

    if (typeof servicePointId !== "string" || servicePointId.trim() === "") {
        throw new Error("INVALID_SERVICE_POINT");
    }

    const servicePoints = await findServicePoints(normalizedPostalCode);
    const servicePoint = servicePoints.find((point) => point.id === servicePointId);

    if (!servicePoint) {
        throw new Error("INVALID_SERVICE_POINT");
    }

    return {
        method,
        postalCode: normalizedPostalCode,
        servicePoint
    };
}

export {
    shippingMethods,
    FREE_SHIPPING_THRESHOLD,
    calculateShippingPrice,
    validateShippingSelection
};