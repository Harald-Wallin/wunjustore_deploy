import { getOrderById } from "./orderService.js";
import { sendEmail } from "../integrations/emailAdapter.js";

//gör dynamiska värden säkra att sätta in som text mellan HTML-taggar
function escapeHtml(value){

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export async function sendOrderConfirmation(orderId){

    const order = await getOrderById(orderId);

    if (!order){
        throw new Error("Order not found for confirmation email");
    }

    const subject = `Wunju Store – Order #${order.id}`;
    const greeting = `THANK YOU ${order.customer.name}, for supporting WUNJU!`;
    const total = `Total: ${order.orderTotal.toFixed(2)} SEK`;

    //gör en string per orderrad. Båda mailversionerna använder samma rader
    const itemLines = order.items.map((item) =>{

        const name = item.beatName || item.productName || "Product";
        const unitPrice = item.unitPrice.toFixed(2);

        return `${name} × ${item.quantity} – ${unitPrice} SEK each`;
    });

    const text = [
        greeting,
        "",
        ...itemLines,
        "",
        total,
        "",
        `Order: ${order.id}`
    ].join("\n"); //radbrytning mellan varje element

    const htmlItems = itemLines.map((line) => {
        return `<li>${escapeHtml(line)}</li>`;
    }).join("");

    const html = `
        <h1>${escapeHtml(greeting)}<h1>
        <ul>${htmlItems}</ul>
        <p><strong>${escapeHtml(total)}</strong></p>
        <p>${escapeHtml(subject)}</p>
    `;

    const environment = process.env.NODE_ENV === "production" ? "production" : "development";

    //sendEmail är asynron, returnerar alltså ett promise
    return sendEmail({
        to: order.customer.email,
        subject,
        html,
        text,
        idempotencyKey: `order-confirmation/${environment}/${order.id}`
    });
}