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

async function getAlbumById(albumId){

    //hämtar först albumet
    const albumResult = await pool.query(`
        SELECT
        id,
        album_name AS "albumName",
        album_price AS "albumPrice",
        release_year AS "releaseYear",
        cover_url AS "coverImage"
        FROM albums
        WHERE id = $1;`,[albumId]
    );
    //..$1 är "parametiserad query" och skyddar mot injections-
    // användare kan inte ange värde direkt i url?

    if (albumResult.rows.length === 0){
        return null;
    }

    //hämtar alla beats från albumet
    const beatsResult = await pool.query(`
        SELECT
        id,
        beat_name AS "beatName",
        album_id AS "albumId",
        beat_price AS "beatPrice",
        preview_url AS "previewUrl"
        FROM beats
        WHERE album_id = $1
        ORDER By id;`, [albumId]
    );

    const album = albumResult.rows[0];
    album.beats=beatsResult.rows;

    return album;
}
export {getAllAlbums, getAlbumById};