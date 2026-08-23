import express from "express";

import { getAllAlbums, getAlbumById } from "../services/albumService.js";

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





export default router;
