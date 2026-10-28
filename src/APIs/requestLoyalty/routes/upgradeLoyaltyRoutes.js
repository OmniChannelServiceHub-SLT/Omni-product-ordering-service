const express = require("express");

const {
  requestLoyalty
} = require(
  "../controllers/upgradeLoyaltyController"
);

const router = express.Router();

router.put("/", requestLoyalty);

module.exports = router;
