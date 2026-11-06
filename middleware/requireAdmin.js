
import pool from "../database/db.js";

export async function requireAdmin(req, res, next) {
    try {

        //hämtar rollen
        const result = await pool.query(
            `
            SELECT user_roles.role_name
            FROM users
            JOIN user_roles ON user_roles.id = users.user_role_id
            WHERE users.id = $1
            `,
            [req.userId]
        );

        //konrollerar behörigeten
        if (result.rows[0]?.role_name !== "admin") {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        //om behörigheten är godkänd
        next();

    } catch (error) {
        console.error("Admin authorization failed:", error);

        return res.status(500).json({
            message: "Authorization failed"
        });
    }
}
