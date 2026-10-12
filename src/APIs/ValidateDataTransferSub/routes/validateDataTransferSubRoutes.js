const express = require("express");

const {
  validateDataTransfer
} = require(
  "../controllers/validateDataTransferSubController"
);

const router = express.Router();

router.get("/", validateDataTransfer);

module.exports = router;
