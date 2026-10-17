import express from "express";
import { z } from "zod";

import { createProduct, updateProduct, deleteProduct } from "../services/productService.js";
import { indexProducts, deleteProductFromIndex } from "../integrations/searchAdapter.js";
import { localOnly } from "../middleware/localOnly.js";

const router = express.Router();

//Skydda alla admin-routes
router.use(localOnly);

//Validering av nya produkter
const createProductSchema = z.object({
    sku: z.string().trim().min(1).max(50),
    ean: z.string().trim().min(1).max(30),
    name: z.string().trim().min(1),
    category: z.string().trim().min(1),
    price: z.number().nonnegative(),
    stock: z.number().int().nonnegative()
});

//Validering av produktändringar
const updateProductSchema = z.object({
    name: z.string().trim().min(1).optional(),
    price: z.number().nonnegative().optional()
}).strict().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" }
);

//POST /api/admin/products
router.post("/", async (req, res, next) => {

    const validation = createProductSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            error: "Invalid product data.",
            details: z.flattenError(validation.error)
        });
    }

    try {
        //spara produkten i PostgreSQL
        const product = await createProduct(validation.data);

        //uppdatera Algolia
        let searchSync = {success: false};

        try {
            await indexProducts([product]);

            searchSync = {success: true, status: "submitted"};

        } catch (error) {
            console.error("Algolia sync failed:", error);
        }

        //Returnera produkten även om Algolia misslyckas
        return res.status(201).json({product, searchSync});

    } catch (error) {

        //PostgreSQL: unique_violation
        if (error.code === "23505") {
            return res.status(409).json({
                error: "A product with this SKU already exists."
            });
        }

        next(error);
    }
});


//PATCH /api/admin/products/:sku
router.patch("/:sku", async (req, res, next) => {

    const validation = updateProductSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            error: "Invalid product data.",
            details: z.flattenError(validation.error)
        });
    }

    try {
        //1. Uppdatera PostgreSQL
        const product = await updateProduct(req.params.sku, validation.data);

        if (!product) {
            return res.status(404).json({
                error: "Product not found."
            });
        }

        //2. Uppdatera Algolia
        let searchSync = { success: false };

        try {
            await indexProducts([product]);

            searchSync = {
                success: true,
                status: "submitted"
            };

        } catch (error) {
            console.error("Algolia sync failed after product update:", error);
        }

        return res.json({
            product,
            searchSync
        });

    } catch (error) {
        next(error);
    }
});


//DELETE /api/admin/products/:sku
router.delete("/:sku", async (req, res, next) => {

    try {
        //ta bort produkten från PostgreSQL
        const product = await deleteProduct(req.params.sku);

        if (!product) {
            return res.status(404).json({
                error: "Product not found."
            });
        }

        //Ta bort produkten från Algolia
        let searchSync = { success: false };

        try {
            await deleteProductFromIndex(product.sku);

            searchSync = {
                success: true,
                status: "submitted"
            };

        } catch (error) {
            console.error("Algolia sync failed after product deletion:", error);
        }

        //Returnera resultatet
        return res.json({
            message: "Product deleted successfully.",
            product,
            searchSync
        });

    } catch (error) {
        next(error);
    }
});


export default router;