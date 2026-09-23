const express = require("express");

const router = express.Router();

const {
    validateBBPurchaseRequest
} = require(
    "../controllers/validateBBPurchaseRequestController"
);

router.get(
    "/validate-bb-purchase-request",
    validateBBPurchaseRequest
);

module.exports = router;