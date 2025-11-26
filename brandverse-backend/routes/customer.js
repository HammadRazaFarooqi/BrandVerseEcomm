const express = require("express");
const router = express.Router();
const { updateCustomer } = require("../controllers/customerController");

// PUT /api/customer/:id
router.put("/:id", updateCustomer);

module.exports = router;
