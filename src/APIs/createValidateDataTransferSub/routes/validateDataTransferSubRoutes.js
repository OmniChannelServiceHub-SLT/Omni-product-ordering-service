const express = require("express");

const router = express.Router();

const {
    validateDataTransferSub
} = require("../controllers/validateDataTransferSubController");

router.get(
    "/validate-data-transfer-sub",
    validateDataTransferSub
);

module.exports = router;