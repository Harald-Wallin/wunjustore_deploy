import express from "express";
import { z } from "zod";
import multer from "multer";

import { createProduct, updateProduct, deleteProduct, getProductBySku, updateProductImage, clearProductImage } from "../services/productService.js";
import { indexProducts, deleteProductFromIndex } from "../integrations/searchAdapter.js";
import {uploadProductImage, removeProductImage} from "../integrations/storageAdapter.js"
import { localOnly } from "../middleware/localOnly.js";

const router = express.Router();

//check för uppladdad fil med Multer
const upload = multer({
    storage: multer.memoryStorage(),//serverns RAM, lagrar buffers
    limits: { fileSize: 4*1024*1024}, //= 4 194 304 byte

    fileFilter: (req, file, callback) => {

        if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png"){//OBS file.mimetype kommer från uppladdningens metadata

            return callback(new Error("Only JPEG and PNG images are allowed!"));
        }

        callback(null, true); // null = inget fel uppstog, true = Multer ska acceptera filen
        
    }
})

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


//POST /api/admin/products/:sku/image
router.post("/:sku/image", upload.single("image"), async (error, req, res, next) =>{
    //Multer middleware!
    //upload.single("image") = multer middleware! Endpoint förväntar sig en fil i ett form som heter "image"
      
    if (error){
        if(error.code === "LIMIT_FILE_SIZE"){
            return res.status(400).json({
                error: "Image is bigger than 4MB"
            })
        }

        return res.status(400).json({
            error: error.message
        })
    }
    next();
    
}, async (req, res, next) => {
    //om ingen fil finns i uppladdningen
    if (!req.file){

        return res.status(400).json({
            error: "No image file provided"
        });
    }

    try{
        //hämtar sku från url
        const sku = req.params.sku;

        //kontrollera att produkt finns
        const product = await getProductBySku(sku)

        if (!product){
            return res.status(404).json({
                error: "product not found"
            });
        }

        //ladda upp till supabase, kör Upload-funktion samt lagrar buffern och mimetype om de finns/har lyckats
        const uploaded = await uploadProductImage(sku, {
            buffer: req.file.buffer,
            mimeType: req.file.mimetype
        });

        let updatedProduct;

        try{
            updatedProduct = await updateProductImage(sku, uploaded.url, uploaded.path);

            if (!updatedProduct) {
                throw new Error ("Something's wrong with this product..!")
            }

        }catch (error){
            
            try{

                await removeProductImage(uploaded.path);

            }catch (cleanupError){

                console.error("Image cleanup failed:", cleanupError);
            }

            //skickar felet vidare till den yttre catch'en
            throw error;
        }

        //tar bort gamla bilden efter lyckad uppdatering
        if (product.image_path){
            try{

                await removeProductImage(product.image_path);
            }catch(error){

                console.error("Old image failed to be deleted:", error);
            }
        }

        //syncar Algolia efter bilduppdatering
        let searchSync = {sucess: false};

        try{

            await indexProducts([updatedProduct]);

            searchSync = {sucess: true, status: "submitted"};

        }catch(error){

            console.error("Algolia sync failed after image upload:", error);
        }

        return res.json({
            message: "Image recieved sucessfully",
            product: updatedProduct, searchSync
        });

    }catch(error){

        next (error);
    }

});


//delete /api/admin/products/:sku/image
router.delete("/:sku/image", async (req, res, next) => {
    try {

        const sku = req.params.sku;
        const product = await getProductBySku(sku);

        if (!product) {
            return res.status(404).json({
                error: "Product not found!"
            });
        }

        if (!product.image_path) {
            return res.status(404).json({
                error: "Product has no image!"
            });
        }

        //rensar bildreferensen i databas
        const updatedProduct = await clearProductImage(sku);

        if (!updatedProduct) {
            throw new Error("Could not update product image");
        }

        //Tar bort bildfilen från Supabase
        try {
            await removeProductImage(product.image_path);
        } catch (error) {
            console.error("Image deletion from Supabase failed:", error);
        }

        //Synkronisera bildraderingen till Algolia
        let searchSync = { success: false };

        try {

            await indexProducts([updatedProduct]);

            searchSync = {success: true, status: "submitted"};

        } catch (error){

            console.error("Algolia sync failed after image deletion:", error);
        }

        return res.json({
            message: "Product image deleted successfully!",
            product: updatedProduct,
            searchSync
        });

    } catch (error) {
        next(error);
    }
});


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

        //ter bort produktbild från Supabase-bucketen
        if (product.image_path) {
            try {
                await removeProductImage(product.image_path);

            } catch (error) {
                console.error("Image cleanup failed after product deletion:", error);
            }
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