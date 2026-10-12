const express = require("express");

const {
  createTransfer
} = require(
  "../controllers/transferDataController"
);

const router = express.Router();

router.post("/", createTransfer);

module.exports = router;
