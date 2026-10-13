
const express = require("express");
const router = express.Router();

const {
    confirmDataGiftController
} = require("../controllers/confirmDataGiftController");

router.post("/", confirmDataGiftController);

module.exports = router;
