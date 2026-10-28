
const express = require("express");
const router = express.Router();

const {
    orderDataGiftEnrollController
} = require("../controllers/orderDataGiftEnrollController");

router.post("/", orderDataGiftEnrollController);

module.exports = router;
