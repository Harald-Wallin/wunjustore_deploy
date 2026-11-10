import jwt from "jsonwebtoken";
import { z } from "zod";

//mall för id_token
const googleTokenResponseSchema = z.object({
    id_token: z.string().min(1)
});

//mall för cookie
const googleClaimsSchema = z.object({
    iss: z.enum(["https://accounts.google.com", "accounts.google.com"]),
    aud: z.string(),
    exp: z.number().int(),
    sub: z.string().min(1),
    email: z.email(),
    email_verified: z.literal(true),
    name: z.string().trim().optional()
});


//bygger ihop google-adressen med urlParams
export function getGoogleAuthorizeUrl(state){

    //hämtar nycklarna från .env
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !callbackUrl){
        return null;
    }

    //sätter ihop URL-parametrarna 
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        response_type: "code",
        scope: "openid email profile",
        state
    });

    //returnerar den färdiga google-url'en
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}


//hämtar och kontrollerar identitet
export async function exchangeGoogleCode(code){

    //.env-nycklar
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !clientSecret || !callbackUrl) {
        throw new Error("Google login configuration is incomplete");
    }

    //skickar engångskod + klientuppgifter + callback-adress till google
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: new URLSearchParams({//formaterar innehållet i body
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: callbackUrl,
            grant_type: "authorization_code"
        }),
        redirect: "error",
        signal: AbortSignal.timeout(5_000)//5sek timeout
    });

    if (!response.ok) {
        throw new Error("Google rejected the login code");
    }

    const tokens = googleTokenResponseSchema.parse(await response.json());//läser svar som JSON
    const claims = googleClaimsSchema.parse(jwt.decode(tokens.id_token));//Läser innehåll i JWT-token

    if (claims.aud !== clientId || claims.exp * 1000 <= Date.now()) {
        throw new Error("Google ID token has the wrong audience or has expired");
    }

    //returnerar värden från google-svaret
    return {
        sub: claims.sub,//subject: googles egna användar-ID
        email: claims.email,//email
        name: claims.name || claims.email
    };
}