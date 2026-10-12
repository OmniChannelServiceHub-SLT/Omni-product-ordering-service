
const express = require("express");
const router = express.Router();

const {
    orderPurchaseExtraGbInitController
} = require("../controllers/orderPurchaseExtraGbInitController");

router.post("/", orderPurchaseExtraGbInitController);

module.exports = router;
