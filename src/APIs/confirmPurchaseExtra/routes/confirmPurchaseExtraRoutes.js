
const express = require("express");
const router = express.Router();

const {
    confirmPurchaseExtraController
} = require("../controllers/confirmPurchaseExtraController");

router.post("/", confirmPurchaseExtraController);

module.exports = router;
