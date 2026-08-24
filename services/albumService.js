import pool from "../database/db.js";

async function getAllAlbums() {

    // Hämtar alla album
    const albumResult = await pool.query(
        `SELECT
            id,
            album_name AS "albumName",
            album_price::float AS "albumPrice",
            release_year AS "releaseYear",
            cover_url AS "coverImage"
        FROM albums
        ORDER BY release_year;
    `);

    // Hämtar alla beats + information om respektive album
    const beatsResult = await pool.query(`
        SELECT
            beats.id,
            beats.beat_name AS "beatName",
            beats.album_id AS "albumId",
            beats.beat_price::float AS "beatPrice",
            beats.preview_url AS "previewUrl",
            albums.album_name AS "albumName",
            albums.cover_url AS "albumCover"
        FROM beats
        JOIN albums
            ON albums.id = beats.album_id
        ORDER BY beats.id;
    `);

    const albums = albumResult.rows;
    const beats = beatsResult.rows;

    // Soerterar beats till respektive album
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

    const albumResult = await pool.query(`
        SELECT
            id,
            album_name AS "albumName",
            album_price::float AS "albumPrice",
            release_year AS "releaseYear",
            cover_url AS "coverImage"
        FROM albums
        WHERE id = $1;
        `,
        [albumId]
    );

    if (albumResult.rows.length === 0) {
        return null;
    }

    const beatsResult = await pool.query(`
        SELECT
            beats.id,
            beats.beat_name AS "beatName",
            beats.album_id AS "albumId",
            beats.beat_price::float AS "beatPrice",
            beats.preview_url AS "previewUrl",
            albums.album_name AS "albumName",
            albums.cover_url AS "albumCover"
        FROM beats
        JOIN albums
            ON albums.id = beats.album_id
        WHERE beats.album_id = $1
        ORDER BY beats.id;
        `,[albumId]
    );

    const album = albumResult.rows[0];
    album.beats = beatsResult.rows;

    return album;
}

//skapar album
async function createAlbum(albumName,albumPrice,releaseYear,coverImage){

    const result = await pool.query(`
        INSERT INTO albums (
            album_name,
            album_price,
            release_year,
            cover_url
        )
        VALUES ($1, $2, $3, $4)

        RETURNING
            id,
            album_name AS "albumName",
            album_price::float AS "albumPrice",
            release_year AS "releaseYear",
            cover_url AS "coverImage";
        `,
        [albumName,
        albumPrice,
        releaseYear,
        coverImage
        ]
    );

    return result.rows[0];
};

export { getAllAlbums, getAlbumById, createAlbum};