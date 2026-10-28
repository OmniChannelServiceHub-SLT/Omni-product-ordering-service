const express = require("express");

const {
  createPackageOrder
} = require("../controllers/orderPackageController");

const router = express.Router();

router.post("/", createPackageOrder);

module.exports = router;
