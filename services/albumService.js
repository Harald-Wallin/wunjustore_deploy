import pool from "../database/db.js";

async function getAllAlbums(){

    //(Query + att backenden översätter postgreSQL'en till)
const result = await pool.query(`
    SELECT 
    id,
    album_name AS "albumName",
    album_price AS "albumPrice",
    release_year AS "releaseYear",
    cover_url AS "coverImage"
    FROM albums
    ORDER BY id;
    `);

    return result.rows;
}

export {getAllAlbums};