import express from "express";
import { updateCustomer } from "../controllers/customerController.js";

const router = express.Router();

// PUT /api/customer/:id
router.put("/:id", updateCustomer);

export default router;
