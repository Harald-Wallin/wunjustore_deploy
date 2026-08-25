import pool from "../database/db.js";

async function createBeat(albumId,beatName,beatPrice,previewUrl) 
{
    const result = await pool.query(`
        INSERT INTO beats (
            album_id,
            beat_name,
            beat_price,
            preview_url
        )
        VALUES ($1, $2, $3, $4)

        RETURNING
            id,
            album_id AS "albumId",
            beat_name AS "beatName",
            beat_price::float AS "beatPrice",
            preview_url AS "previewUrl";
        `,[
        albumId,
        beatName,
        beatPrice,
        previewUrl
        ]
    );

    return result.rows[0];
}

export { createBeat };