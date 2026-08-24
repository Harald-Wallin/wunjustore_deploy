import express from "express";

import { getAllAlbums, getAlbumById, createAlbum, updateAlbum} from "../services/albumService.js";

const router = express.Router();

//Reminder to self: get gär är inte en "GET" som SKICKAS, utan är en funktion som exekveras
//när get-requesten kommer matchande adressen

//HÄMTAR ALLA ALBUM
router.get("/", async (request, response) => {
    try{
        const albums = await getAllAlbums();

        response.status(200).json(albums);
    }catch (error){
        console.error("Failed to get albums (this time..):", error);
    
        response.status(500).json({
            sucess: false,
            message: "Could not fetch albums this time..)",
        });
    };
});

//HÄMTAR SPECIFIKT ALBUM (designen visar sedan alla tracks tillhörande)
router.get("/:albumId", async (request, response) => {
    try{
        const albumId = Number(request.params.albumId);
        const album = await getAlbumById(albumId);

        if (!album){
            return response.status(404).json({
                sucess: false,
                message: "Album not found"
            });
        };

        response.status(200).json(album);

    }catch (error){
        console.error("Failed to get album (this time..):", error);
    
        response.status(500).json({
            sucess: false,
            message: "Could not fetch album this time..)",
        });
    };
});

//POST - SKAPA nytt ALBUM
router.post("/", async (request, response) => {
    try {

        const {albumName,albumPrice,releaseYear,coverImage} = request.body;

        //lite null/felinmatnings-uppfång
        if (!albumName) {
            return response.status(400).json({
                success: false,
                message: "Album name is required"
            });
        };

        if (
            albumPrice === undefined ||
            Number.isNaN(Number(albumPrice))
        ) {
            return response.status(400).json({
                success: false,
                message: "Valid album price is required"
            });
        };

        //Create album
        const album = await createAlbum(
            albumName,
            Number(albumPrice),
            releaseYear ? Number(releaseYear) : null,
            coverImage || null
        );


        response.status(201).json({
            success: true,
            album
        });

    } catch (error) {
        console.error("Failed to create album:",error);

        response.status(500).json({
            success: false,
            message: "Could not create album"
        });
    }
});

//PUT
router.put("/:albumId", async (request, response) => {
    try {
        const albumId = Number(request.params.albumId);

        const {albumName,albumPrice,releaseYear,coverImage} = request.body;


        if (!albumName) {
            return response.status(400).json({
                success: false,
                message: "Album name is required"
            });
        };

        if (
            albumPrice === undefined ||
            //NaN för pris = undefined/null
            Number.isNaN(Number(albumPrice))
        ) {
            return response.status(400).json({
                success: false,
                message: "Valid album price is required"
            });
        };


        const updatedAlbum = await updateAlbum(
            albumId,
            albumName,
            Number(albumPrice),
            releaseYear ? Number(releaseYear) : null,
            coverImage || null
        );


        if (!updatedAlbum) {
            return response.status(404).json({
                success: false,
                message: "Album not found"
            });
        }


        response.status(200).json({
            success: true,
            album: updatedAlbum
        });

    }catch (error) {
        console.error("Failed to update album:",error);

        response.status(500).json({
            success: false,
            message: "Could not update album"
        });
    };
});


export default router;
