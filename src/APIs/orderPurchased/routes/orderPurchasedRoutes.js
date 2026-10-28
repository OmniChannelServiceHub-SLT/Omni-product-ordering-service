const express = require("express");
const router = express.Router();

const {
    orderPurchasedController
} = require("../controllers/orderPurchasedController");

router.post("/", orderPurchasedController);

module.exports = router;