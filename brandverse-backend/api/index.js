import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import cors from "cors";

import authRoutes from "../routes/auth.js";
import categoryRoutes from "../routes/category.js";
import productRoutes from "../routes/product.js";
import uploadRoutes from "../routes/uploads.js";
import customerRoutes from "../routes/customer.js";
import orderRoutes from "../routes/orderRoutes.js";

const app = express();

// CORS
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

// Read swagger JSON safely
const swaggerFilePath = path.join(process.cwd(), "swagger-output.json");

let swaggerDocument = {};
try {
  swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, "utf-8"));
  console.log("Swagger file loaded successfully");
} catch (err) {
  console.error("Swagger file not found or invalid:", err);
}

// Swagger routes
app.use("/swagger.json", (req, res) => res.json(swaggerDocument));
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Brand Verse API Docs",
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/orders", orderRoutes);

// Root
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Brand Verse API" });
});

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  } else {
    console.error("Server error:", err);
  }
});

export default app;
