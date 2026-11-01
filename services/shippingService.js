//PROMPT #3, #4, #5, #6
import { findServicePoints, getDeliveryEstimate as fetchDeliveryEstimate } from "../integrations/shippingAdapter.js";

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

//PROMPT 11
function getLocalStartTime() {
    // Förenklad prognosmodell: nästa vardag kl. 08:00, inte en garanterad överlämningstid.
    const now = new Date();
    const stockholmDate = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Europe/Stockholm",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short"
    }).formatToParts(now);
    const values = Object.fromEntries(stockholmDate.map(({type, value}) => [type, value]));
    const date = new Date(Date.UTC(
        Number(values.year),
        Number(values.month) - 1,
        Number(values.day)
    ));

    date.setUTCDate(date.getUTCDate() + 1);
    while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
        date.setUTCDate(date.getUTCDate() + 1);
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}T08:00`;
}

async function getDeliveryEstimate(method, destinationPostalCode) {
    if (shippingMethods[method] === undefined) {
        throw new Error("INVALID_SHIPPING_METHOD");
    }

    const normalizedDestinationPostalCode = normalizePostalCode(destinationPostalCode);
    const configuredOriginPostalCode = process.env.POSTNORD_ORIGIN_POSTAL_CODE;
    if (
        typeof configuredOriginPostalCode !== "string"
        || !/^\d{3}\s?\d{2}$/.test(configuredOriginPostalCode.trim())
    ) {
        throw new Error("POSTNORD_CONFIGURATION_ERROR");
    }

    const originPostalCode = normalizePostalCode(configuredOriginPostalCode);
    const serviceCode = method === "service_point" ? 19 : 17;

    return fetchDeliveryEstimate({
        serviceCode,
        originPostalCode,
        destinationPostalCode: normalizedDestinationPostalCode,
        startTime: getLocalStartTime()
    });
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
    validateShippingSelection,
    getDeliveryEstimate
};