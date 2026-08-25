import express from "express";

import { createBeat, getBeatById, updateBeat} from "../services/beatService.js";

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


//get beat > id
router.get("/:beatId", async (request, response)=>{
    try {

        const beatId = Number(request.params.beatId);
        const beat = await getBeatById(beatId);

        if (!beat){
            return response.status(404).json({
                success: false,
                message: "Beat not found"
            });
        }

        response.status(200).json({
            success: true,
            beat
        });

    } catch (error) {

        console.error("Failed to get beat:",error);

        response.status(500).json({
            success: false,
            message: "Could not fetch beat"
        });
    }
});


//PUT Beat 
router.put("/:beatId", async (request, response) => {
    try {

        const beatId = Number(request.params.beatId);

        const {albumId,beatName,beatPrice,previewUrl} = request.body;

        if (!albumId) {
            return response.status(400).json({
                success: false,
                message: "albumId is required"
            });
        }


        if (!beatName) {
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


        const updatedBeat = await updateBeat(
            beatId,
            Number(albumId),
            beatName,
            Number(beatPrice),
            previewUrl
            || null);


        if (!updatedBeat) {
            return response.status(404).json({
                success: false,
                message: "Beat not found"
            });
        };


        response.status(200).json({
            success: true,
            beat: updatedBeat
        });

    } catch (error) {

        console.error("Failed to update beat:",error);


        if (error.code === "23503") {
            return response.status(400).json({
                success: false,
                message: "Album does not exist"
            });
        };


        response.status(500).json({
            success: false,
            message: "Could not update beat"
        });
    };
});

export default router;