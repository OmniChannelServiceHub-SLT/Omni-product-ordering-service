const express = require("express");
const router = express.Router();

const {
    retrievePurchaseController
} = require("../controllers/retrievePurchaseController");

router.get("/", retrievePurchaseController);

module.exports = router;