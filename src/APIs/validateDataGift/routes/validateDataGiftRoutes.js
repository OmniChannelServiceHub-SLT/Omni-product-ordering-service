
const express = require("express");
const router = express.Router();

const {
    validateDataGiftController
} = require("../controllers/validateDataGiftController");

router.get("/", validateDataGiftController);

module.exports = router;
