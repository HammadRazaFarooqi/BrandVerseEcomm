require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../swagger-output.json");
const authRoutes = require("../routes/auth");
const categoryRoutes = require("../routes/category");
const productRoutes = require("../routes/product");
const uploadRoutes = require("../routes/uploads");
const customerRoutes = require("../routes/customer");
const orderRoutes = require("../routes/orderRoutes");
const cors = require("cors");

const app = express();
app.use(cors());

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});



// Swagger setup with CDN links
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    url: "/swagger.json",
  },
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Brand Verse API Docs",
  customfavIcon: "https://swagger.io/favicon-32x32.png",
  customCssUrl: [
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui.min.css",
  ],
  customJs: [
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui-bundle.js",
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui-standalone-preset.js",
  ],
};

// Serve swagger.json
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerFile);
});

// Swagger docs endpoint
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerFile, swaggerOptions));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/customer", customerRoutes); 
app.use('/api', orderRoutes);
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1); // or handle as needed
  } else {
    console.error('Server error:', err);
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Brand Verse API" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

module.exports = app;
