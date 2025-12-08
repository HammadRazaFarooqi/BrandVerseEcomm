import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { connectDB } from "../lib/db.js"; // <-- connectDB import

import authRoutes from "../routes/auth.js";
import categoryRoutes from "../routes/category.js";
import productRoutes from "../routes/product.js";
import uploadRoutes from "../routes/uploads.js";
import customerRoutes from "../routes/customer.js";
import orderRoutes from "../routes/orderRoutes.js";

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

// --- Swagger ---
const swaggerFilePath = path.join(process.cwd(), "swagger-output.json");
let swaggerDocument = {};
try {
  swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, "utf-8"));
} catch (err) {
  console.error("Swagger file not found or invalid:", err);
}
app.use("/swagger.json", (req, res) => res.json(swaggerDocument));
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Affi Mall API Docs",
  })
);

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api", orderRoutes);

app.get("/", (req, res) => res.json({ message: "Welcome to Affi Mall API" }));

// --- Start Server after DB connection ---
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

export default app;
