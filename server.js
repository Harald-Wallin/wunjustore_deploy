import cors from "cors";
import "dotenv/config";
import express from "express";
import albumRoutes from "./routes/albumRoutes.js";

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

app.use((request, response) => {
  response.status(404).json({
    success: false,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});