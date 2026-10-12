const express = require("express");

const {
  redeemVoucher
} = require(
  "../controllers/redeemVoucherController"
);

const router = express.Router();

router.post("/", redeemVoucher);

module.exports = router;
