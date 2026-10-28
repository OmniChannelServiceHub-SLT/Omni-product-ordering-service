const express = require("express");

const {
  orderAddVasBundle
} = require(
  "../controllers/addVASDataBundlePostPaidController"
);

const router = express.Router();

router.post("/", orderAddVasBundle);

module.exports = router;
