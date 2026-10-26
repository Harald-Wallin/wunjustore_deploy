import cors from "cors";
import "dotenv/config";
import express from "express";

import {getSupplierCsv, getSupplierProductsFromCsv} from "./integrations/supplierAdapter.js";
import { normalizeSupplierProduct } from "./integrations/normalizeSupplierProduct.js";
import { SupplierProductSchema } from "./integrations/supplierProductSchema.js";
import { validateSupplierProducts } from "./integrations/validateSupplierProducts.js";

//Routes
import albumRoutes from "./routes/albumRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import beatRoutes from "./routes/beatRoutes.js";
import currencyRoutes from "./routes/currencyRoutes.js";
import supplierImportRoutes from "./routes/supplierImportRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import stripeWebhookRoutes from "./routes/stripeWebhookRoutes.js";

const app = express();

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_URL,
  }),
);

//stripe webhook route- ligger före express.json för att hooken använder rå data och ska INTE
//omvandlas till json!
app.use("/api/stripe/webhook", stripeWebhookRoutes);

app.use(express.json());

app.get("/api/health", (request, response) => {
  response.status(200).json({
    success: true,
    message: "Beat Store API is running",
  });
});

app.use("/api/albums", albumRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/beats", beatRoutes);
app.use ("/api/currency", currencyRoutes);
app.use("/api/admin/supplier", supplierImportRoutes);
app.use("/api/products", productRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/checkout", checkoutRoutes);



app.get("/api/test/supplier-csv", async (request, response) => {

    console.log("TEST: Express-routen har anropats!");

    const csvText = await getSupplierCsv();

    response.type("text/plain; charset=utf-8");
    response.send(csvText);
});

app.get("/api/test/supplier-products", async (request, response) => {

    const rawProducts = await getSupplierProductsFromCsv();

    const result = validateSupplierProducts(rawProducts);

    response.json({
        total: rawProducts.length,
        valid: result.validProducts.length,
        skipped: result.skippedProducts.length,
        skippedProducts: result.skippedProducts
    });
});

/*app.get("/api/test/supplier-products", async (request, response) => {

    const products = await getSupplierProductsFromCsv();

    const firstProduct = normalizeSupplierProduct(products[0]);

    const validation = SupplierProductSchema.safeParse(firstProduct);

    response.json({
        count: products.length,
        firstProduct,
        validation: {
            success: validation.success, //True/false
            errors: validation.success   //vad som HÄNDER om success eller error
                ? []
                : validation.error.issues
        }
    });
});*/






app.use((request, response) => {
  response.status(404).json({
    success: false,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  });
});

app.use((error, request, response, next) => {
    console.error(error);

    response.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});