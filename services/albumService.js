import pool from "../database/db.js";

async function getAllAlbums() {

    //hämtar album, konverterar price till float
    const albumResult = await pool.query(`
        SELECT
        id,
        album_name AS "albumName",
        album_price::float AS "albumPrice",
        release_year AS "releaseYear",
        cover_url AS "coverImage"
        FROM albums
        ORDER BY release_year;
    `);

    //hämtar beats
    const beatsResult = await pool.query(`
        SELECT
        id,
        beat_name AS "beatName",
        album_id AS "albumId",
        beat_price::float AS "beatPrice",
        preview_url AS "previewUrl"
        FROM beats
        ORDER BY id;
    `);

    const albums = albumResult.rows;
    const beats = beatsResult.rows;

    //soerterar upp alla beats till respektive album
    const albumsWithBeats = albums.map((album) => {
        const albumBeats = beats.filter(
            (beat) => beat.albumId === album.id
        );

        return {
            ...album,
            beats: albumBeats,
        };
    });

    return albumsWithBeats;
}


async function getAlbumById(albumId) {
    const albumResult = await pool.query(
        `
        SELECT
        id,
        album_name AS "albumName",
        album_price::float AS "albumPrice",
        release_year AS "releaseYear",
        cover_url AS "coverImage"
        FROM albums
        WHERE id = $1;
        `,[albumId]
    );

    if (albumResult.rows.length === 0) {
        return null;
    }

    const beatsResult = await pool.query(
        `
        SELECT
        id,
        beat_name AS "beatName",
        album_id AS "albumId",
        beat_price::float AS "beatPrice",
        preview_url AS "previewUrl"
        FROM beats
        WHERE album_id = $1
        ORDER BY id;
        `,[albumId]
    );

    const album = albumResult.rows[0];
    album.beats = beatsResult.rows;

    return album;
}

export {
    getAllAlbums,
    getAlbumById
};