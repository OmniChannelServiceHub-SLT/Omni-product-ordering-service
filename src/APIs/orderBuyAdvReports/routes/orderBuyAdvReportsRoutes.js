
const express = require("express");
const router = express.Router();

const {
    orderBuyAdvReportsController
} = require("../controllers/orderBuyAdvReportsController");

router.post("/", orderBuyAdvReportsController);

module.exports = router;
