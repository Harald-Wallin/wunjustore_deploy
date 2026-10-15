import express from "express";
import {z} from "zod";
import {searchProducts} from "../integrations/searchAdapter.js";

const router = express.Router();

//Zod-regler (coerce= omvandla värde till en viss datatyp)
const searchQuerySchema = z.object({

    q: z.string().max(100).default(""),

    page: z.coerce.number().int().min(1).default(1),

    //Värdet ska vara ett heltal mella 1 och 50, standardvärde 10 om parameter saknas
    pageSize: z.coerce.number().int().min(1).max(50).default(10)
});

//"api/search/"
router.get("/", async (req, res) => {

    //validerar parametrarna med zod
    const validation = searchQuerySchema.safeParse(req.query);

    if (!validation.success) {
        return res.status(400).json({
            error: "Invalid search parameters",

            //validation.error.flatten() var deprecated, så treeifyError istället 
            details: z.treeifyError(validation.error)
        });
    }

    //query, page och pagesize från valideringen
    const { q, page, pageSize } = validation.data;

    try {
        //algolia-sökningen
        const result = await searchProducts(q, page, pageSize);

        return res.json(result);

    } catch (error) {
        console.error("Algolia search failed:", error);

        return res.status(502).json({
            error: "Search service is temporarily unavailable"
        });
    }
});

export default router;