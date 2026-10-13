import cors from "cors";
import "dotenv/config";
import express from "express";
import {getSupplierCsv, getSupplierProductsFromCsv} from "./integrations/supplierAdapter.js";

//Routes
import albumRoutes from "./routes/albumRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import beatRoutes from "./routes/beatRoutes.js";
import currencyRoutes from "./routes/currencyRoutes.js";

const app = express();

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_URL,
  }),
);

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



app.get("/api/test/supplier-csv", async (request, response) => {

    console.log("TEST: Express-routen har anropats!");

    const csvText = await getSupplierCsv();

    response.type("text/plain; charset=utf-8");
    response.send(csvText);
});

app.get("/api/test/supplier-products", async (request, response) => {

    const products = await getSupplierProductsFromCsv();

    console.log("Antal produkter:", products.length);
    console.log("Första produkten:", products[0]);

    response.json({
        count: products.length,
        firstProduct: products[0]
    });
});






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