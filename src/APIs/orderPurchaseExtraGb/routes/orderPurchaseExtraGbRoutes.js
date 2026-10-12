
const express = require("express");
const router = express.Router();

const {
    orderPurchaseExtraGbController
} = require("../controllers/orderPurchaseExtraGbController");

router.post("/", orderPurchaseExtraGbController);

module.exports = router;
