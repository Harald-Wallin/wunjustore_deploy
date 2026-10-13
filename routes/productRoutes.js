import express from "express";
import { getAllProducts } from "../services/productService.js";

const router = express.Router();

//GET /api/products
router.get("/", async (req, res, next) => {

    try {
        const products = await getAllProducts();

        res.json(products);

    } catch (error) {
        next(error);
    }
});

export default router;