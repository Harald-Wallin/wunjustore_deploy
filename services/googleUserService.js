import pool from "../database/db.js";

async function findUserIdByGoogleSub(sub){

    const result = await pool.query(
        "SELECT id FROM users WHERE google_sub = $1",
        [sub]
    );

    //om rows finns visa id eller null
    return result.rows[0]?.id ?? null;
}

//tar parametrarna från google-adaptern och returnerar kund-ID
export async function findOrCreateGoogleUser({sub, email, name}) {
    const existingUserId = await findUserIdByGoogleSub(sub);


    if (existingUserId !== null) {
        return existingUserId;
    }

    try {

        //Skapar en ny användare om email är ledig
        const result = await pool.query(`
            INSERT INTO users (user_name, user_email, user_role_id, google_sub)
            SELECT
                $1,
                LOWER($2),
                (SELECT id FROM user_roles WHERE role_name = 'customer'),
                $3
            WHERE NOT EXISTS (
                SELECT 1 FROM users WHERE LOWER(user_email) = LOWER($2)
            )
            ON CONFLICT (google_sub) DO NOTHING
            RETURNING id`, 
        [name, email, sub]);

        if (result.rows[0]){
            return result.rows[0].id;
        }

    } catch (error){

        if (error.code !== "23505" || error.constraint !== "users_user_email_key") {
            throw error;
        }
    }

    return findUserIdByGoogleSub(sub);
}