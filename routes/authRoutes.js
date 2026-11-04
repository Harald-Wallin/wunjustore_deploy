import {Router} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import pool from "../database/db.js";

const router = Router();

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
                u.id,
                u.user_name,
                u.user_email,
                u.password_hash,
                r.role_name
            FROM users u
            JOIN user_roles r ON r.id = u.user_role_id
            WHERE LOWER(u.user_email) = LOWER($1)
        `,[email.trim()]);

        const user = result.rows[0];

        //felmeddelande om email eller lösenord är fel
        if (!user || !user.password_hash ||
            !(await bcrypt.compare(password, user.password_hash))) {
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

export default router;
