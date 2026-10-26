
const express = require("express");
const router = express.Router();

const {
    orderUnsubscribeAdvController
} = require("../controllers/orderUnsubscribeAdvController");

router.post("/", orderUnsubscribeAdvController);

module.exports = router;
