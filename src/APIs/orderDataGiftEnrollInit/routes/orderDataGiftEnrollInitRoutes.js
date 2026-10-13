
const express = require("express");
const router = express.Router();

const {
    orderDataGiftEnrollInitController
} = require("../controllers/orderDataGiftEnrollInitController");

router.post("/", orderDataGiftEnrollInitController);

module.exports = router;
