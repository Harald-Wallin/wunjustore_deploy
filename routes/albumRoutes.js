import express from "express";

import { getAllAlbums } from "../services/albumService.js";

const router = express.Router();

//Reminder to self: get gär är inte en "GET", utan är en funktion som exekveras
//get-requesten kommer till den satta adressen
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

export default router;
