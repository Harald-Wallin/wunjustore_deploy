import express from "express";
import { importSupplierProducts } from "../services/importSupplierProducts.js";

const router = express.Router();

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

export default router;