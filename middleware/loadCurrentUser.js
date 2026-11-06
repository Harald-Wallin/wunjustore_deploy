
import pool from "../database/db.js";

export async function loadCurrentUser(req, res, next){
    try {

        const result = await pool.query(
            `
            SELECT
                users.id,
                user_roles.role_name
            FROM users
            JOIN user_roles  ON user_roles.id = users.user_role_id
            WHERE users.id = $1
            `,
            [req.userId]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        req.currentUser = {
            id: user.id,
            role: user.role_name
        };

        next();

    } catch (error) {
        console.error("Failed to load current user:", error);

        return res.status(500).json({
            message: "Failed to load user"
        });
    }
}
