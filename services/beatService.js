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
};



//get by id
async function getBeatById(beatId){

    const result = await pool.query(`
        SELECT
            id,
            album_id AS "albumId",
            beat_name AS "beatName",
            beat_price::float AS "beatPrice",
            preview_url AS "previewUrl"
        FROM beats
        WHERE id = $1;
        `,[beatId]
    );


    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};


//update baet
async function updateBeat(beatId,albumId,beatName,beatPrice,previewUrl) 
{
    const result = await pool.query(`
        UPDATE beats
        SET
            album_id = $1,
            beat_name = $2,
            beat_price = $3,
            preview_url = $4

        WHERE id = $5

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
        previewUrl,
        beatId
        ]
    );


    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

export { createBeat };