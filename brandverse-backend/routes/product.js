import { 
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts
  } from "../controllers/productController.js";
  
  import express from "express";
  const router = express.Router();
  
  router.get("/search", searchProducts);
  router.post("/", createProduct);
  router.get("/", getAllProducts);
  router.get("/:id", getProductById);
  router.put("/:id", updateProduct);
  router.delete("/:id", deleteProduct);
  
  export default router;
  