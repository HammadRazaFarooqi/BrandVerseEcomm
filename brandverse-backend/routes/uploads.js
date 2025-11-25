
const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");

router.get("/signature", uploadController.getUploadedFile);
router.post("/destroy", uploadController.saveUploadFile);


module.exports = router;
