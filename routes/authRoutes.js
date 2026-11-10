import {Router} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import pool from "../database/db.js";

import { requireAuth } from "../middleware/requireAuth.js";
import { randomBytes } from "node:crypto";
import { getGoogleAuthorizeUrl } from "../integrations/googleAdapter.js";

const router = Router();

//"Externa" cookieinställningar så startrouten och callback får samma
const googleStateCookieOptions ={
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google"
};

//"_req", understräck betyder att parametern inte kommer användas
router.get("/google", (_req, res) =>{

    //slumpar fram ett string-värde, t.ex
    //"CQj9mPK5neruVR5Ax-Gy9hOdE6NCmOcISUMdCtvHUE8TApJ9ycGIo2cZk7KmjQt5o30O62vJ1N_BIhr8aUXa70"
    //State skickas till google-adressen och sparas i en kortlivad cookie 
    const state = randomBytes(32).toString("base64url");
    const googleUrl = getGoogleAuthorizeUrl(state);

    //console.log(state);

    if (!googleUrl) {
        return res.status(503).json({
            message: "Google login is currently unavailable"
        });
    }

    //spread operator som tar innehållet i googleStateCookieOptions och lägger till en timer
    res.cookie("google_oauth_state", state,{
        ...googleStateCookieOptions,
        maxAge: 10 * 60 * 1000
    });

    return res.redirect(googleUrl);
});

//Googles svarsanrop
router.get("/google/callback", (req, res) =>{

    //console.log("GOOGLE CALLBACK REQ: ", req);
    console.log ("GOOGLE CALLBACK REQ.QUERY: ", req.query);

    const {code, state, error} = req.query;
    const expectedState = req.cookies.google_oauth_state;

    res.clearCookie("google_oauth_state", googleStateCookieOptions);

    if (typeof state !== "string" || !state || state !== expectedState) {
        return res.status(400).json({
            message: "Google login could not be verified. Please try again."
        });
    }

    if (error) {
        return res.status(400).json({
            message: "Google login was interrupted. Please try again."
        });
    }

    if (typeof code !== "string" || !code) {
        return res.status(400).json({
            message: "Google did not return a login code."
        });
    }

    return res.json({
        message: "Google callback received and state matched."
    });
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

        // JWT identifierar användaren via befintligt users.id.
        const token = jwt.sign(
            { sub: String(user.id) },
            process.env.JWT_SECRET,
            { expiresIn: "8h", algorithm: "HS256" }
        );

        // I produktion använder vi Secure + SameSite=None
        // eftersom Vercel och Render ligger på olika domäner.
        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 8 * 60 * 60 * 1000,
            path: "/"
        });

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
