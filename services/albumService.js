import pool from "../database/db.js";

async function getAllAlbums(){
const result = await pool.query(`
    SELECT id,
    album_name,
    album_price,
    release_year,
    cover_url
    FROM albums
    ORDER BY id;
    `);

    return result.rows;
}

export {getAllAlbums};