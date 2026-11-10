export function getGoogleAuthorizeUrl(state){

    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !callbackUrl){
        return null;
    }

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        response_type: "code",
        scope: "openid email profile",
        state
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}