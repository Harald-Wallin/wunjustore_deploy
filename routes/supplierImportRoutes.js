import express from "express";
import { importSupplierProducts } from "../services/importSupplierProducts.js";
import { fullSyncProductsToAlgolia} from "../services/searchSyncService.js";

//Adminskydd
import { localOnly } from "../middleware/localOnly.js";

const router = express.Router();

//Adminskydd
router.use(localOnly);

router.post("/import", async (req, res, next) => {
    try {
        const format = req.body?.format ?? "csv";

        if (format !== "csv" && format !== "xml") {
            return res.status(400).json({
                error: "Formatet måste vara csv eller xml"
            });
        }

        const result = await importSupplierProducts(format);

        res.json(result);

    } catch (error) {
        next(error);
    }
});

//".../api/admin/supplier/search/sync"
//synkar databasens produkter till algolia
router.post("/search/sync", async (req, res, next) => {
    try {
        const result = await fullSyncProductsToAlgolia();

        res.json({
            message: "Search index updated successfully!",
            ...result
        });

    } catch (error) {
        next(error);
    }
});

export default router;