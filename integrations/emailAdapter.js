import { z } from "zod";

//Mall för Resends svar
const resendResponseSchema = z.object({
    id: z.string().min(1)
});

//Idempotency = att uträtta samma operation flera gånger ger samma
//resultat som att uträtta den en gång. Nyckeln gäller i 24h
export async function sendEmail({to, subject, html, text, idempotencyKey}){

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
        throw new Error("Resend .env settings are missing");
    }

    const response = await fetch("https://api.resend.com/emails",{
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify({ from, to, subject, html, text }),
        signal: AbortSignal.timeout(5_000) //kan avbryta anrop
    });

    if (!response.ok){
        throw new Error(`Resend returned HTTP ${response.status}`);
    }

    //parsar enligt zod-schemat
    const result = resendResponseSchema.parse(await response.json());

    //returnerar Resends egna ID på det skickade mailet
    return result.id;
}