import {Router} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import pool from "../database/db.js";

import { requireAuth } from "../middleware/requireAuth.js";
import { randomBytes } from "node:crypto";
import { getGoogleAuthorizeUrl, exchangeGoogleCode } from "../integrations/googleAdapter.js";
import { findOrCreateGoogleUser } from "../services/googleUserService.js";

const router = Router();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

//gemensam rediret för google-fel
function redirectGoogleLoginError(res, reason){

    const loginUrl = new URL("/login", CLIENT_URL);
    loginUrl.searchParams.set("googleError", reason);

    return res.redirect(loginUrl.toString());
}

//"Externa" cookieinställningar så startrouten och callback får samma format
const googleStateCookieOptions ={
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google"
};


//Skapar Cookie- userId kommer från service efter kund skapats/hittats i databas
function setAuthCookie(res, userId){

    //skapar själva tokenet. 
    const token = jwt.sign(
        { sub: String(userId) },
        process.env.JWT_SECRET,
        { expiresIn: "8h", algorithm: "HS256" }
    );

    //I produktion använder vi secure + sameSite=none
    const isProduction = process.env.NODE_ENV === "production";

    //lägger token i res-svaret med instruktionen: spara en cookie med namnet access_token, och använd JWT'n
    //som värde + dessa inställningar
    res.cookie("access_token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 8 * 60 * 60 * 1000,
        path: "/"
    });
}

//"_req", understräck betyder att parametern inte kommer användas
router.get("/google",(_req, res) =>{

    //slumpar fram ett string-värde, t.ex
    //"CQj9mPK5neruVR5Ax-Gy9hOdE6NCmOcISUMdCtvHUE8TApJ9ycGIo2cZk7KmjQt5o30O62vJ1N_BIhr8aUXa70"
    //State skickas till google-adressen och sparas i en kortlivad cookie 
    const state = randomBytes(32).toString("base64url");
    const googleUrl = getGoogleAuthorizeUrl(state);

    //console.log(state);

    if (!googleUrl){
        return redirectGoogleLoginError(res, "failed");
    }

    //spread operator (+ timer)
    res.cookie("google_oauth_state", state,{
        ...googleStateCookieOptions,
        maxAge: 10 * 60 * 1000
    });

    return res.redirect(googleUrl);
});

//Googles svarsanrop
router.get("/google/callback", async (req, res) =>{

    //console.log("GOOGLE CALLBACK REQ: ", req);
    //console.log ("GOOGLE CALLBACK REQ.QUERY: ", req.query);

    const {code, state, error} = req.query;
    const expectedState = req.cookies.google_oauth_state;

    res.clearCookie("google_oauth_state", googleStateCookieOptions);

    if (typeof state !== "string" || !state || state !== expectedState){

        return redirectGoogleLoginError(res, "invalid-state");
    }

    
    if(error){
        //googles kod "access_denied" görs om till "cancelled", andra google-fel blir "failed"
        const reason = error === "access_denied" ? "cancelled" : "failed";
        return redirectGoogleLoginError(res, reason);
    }

    if (typeof code !== "string" || !code){
        return redirectGoogleLoginError(res, "failed");
    }

    let googleProfile;

    try{
        googleProfile = await exchangeGoogleCode(code);

    }catch{

        return res.status(502).json({message: "Could not complete Google login- please try again"});
    }

    try{

        const userId = await findOrCreateGoogleUser(googleProfile);

        if (userId === null){
            return redirectGoogleLoginError(res, "email-in-use");
        }

        setAuthCookie(res, userId);
        return res.redirect(CLIENT_URL);

    }catch{

        return redirectGoogleLoginError(res, "failed");
    }

});

router.post("/login", async (req, res) => {
    const {email, password} = req.body;

    //kontroll av inkommande uppgifter
    if (typeof email !== "string" || typeof password !== "string" ||
        !email.trim() || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    try {
        //hämta användare och roll från databas
        const result = await pool.query(`
            SELECT
                users.id,
                users.user_name,
                users.user_email,
                users.password_hash,
                user_roles.role_name
            FROM users
            JOIN user_roles ON user_roles.id = users.user_role_id
            WHERE LOWER(users.user_email) = LOWER($1)
        `,[email.trim()]);

        const user = result.rows[0];

        //felmeddelande om email eller lösen är fel
        if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))){
            
            return res.status(401).json({
                message: "Incorrect email or password"
            });
        }

        setAuthCookie(res, user.id);

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.user_name,
                email: user.user_email,
                role: user.role_name
            }
        });

    } catch (error) {
        console.error("Login failed:", error);

        return res.status(500).json({
            message: "Login failed"
        });
    }
});

//Här används requireAuth (som innehåller 'next();' )som en middleware 
router.get("/me", requireAuth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id,
                u.user_name,
                u.user_email,
                r.role_name
            FROM users u
            JOIN user_roles r ON r.id = u.user_role_id
            WHERE u.id = $1
        `, [req.userId]);

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        return res.json({
            user: {
                id: user.id,
                name: user.user_name,
                email: user.user_email,
                role: user.role_name
            }
        });

    } catch (error) {
        console.error("Failed to fetch current user:", error);

        return res.status(500).json({
            message: "Failed to fetch user"
        });
    }
});

//rensar cookien i webläsaren
router.post("/logout", (req, res) => {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("access_token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/"
    });

    return res.json({
        message: "Logout successful"
    });
});


export default router;
