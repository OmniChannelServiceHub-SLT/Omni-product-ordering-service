const express = require("express");

const {
  orderBbPackageChange
} = require(
  "../controllers/bbPackageChangeRequestController"
);

const router = express.Router();

router.post("/", orderBbPackageChange);

module.exports = router;
