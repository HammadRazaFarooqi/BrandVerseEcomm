import express from "express";
import { getUploadedFile, saveUploadFile } from "../controllers/uploadController.js";

const router = express.Router();

router.get("/signature", getUploadedFile);
router.post("/destroy", saveUploadFile);

export default router;
