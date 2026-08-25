import express from "express";

import { createBeat } from "../services/beatService.js";

const router = express.Router();


//post beats
router.post("/", async (request, response) => {
    try {
        const {albumId,beatName,beatPrice,previewUrl} = request.body;

        if (!albumId){
            return response.status(400).json({
                success: false,
                message: "albumId is required"
            });
        };


        if (!beatName){
            return response.status(400).json({
                success: false,
                message: "Beat name is required"
            });
        };


        if (beatPrice === undefined || Number.isNaN(Number(beatPrice)))
            {
            return response.status(400).json({
                success: false,
                message: "Valid beat price is required"
            });
        };


        const beat = await createBeat(Number(albumId),beatName,Number(beatPrice),previewUrl || null);

        response.status(201).json({
            success: true,
            beat
        });

    } catch (error) {
        console.error("Failed to create beat:",error);

        //en "foreign key violation" i PostgreSQL
        if (error.code === "23503") {
            return response.status(400).json({
                success: false,
                message: "Album does not exist"
            });
        }


        response.status(500).json({
            success: false,
            message: "Could not create beat"
        });
    };
});

export default router;