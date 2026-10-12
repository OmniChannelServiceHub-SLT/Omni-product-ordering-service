const express = require("express");

const {
  orderVasBundle
} = require(
  "../controllers/vasBundleUnsubscriptionController"
);

const router = express.Router();

router.post("/", orderVasBundle);

module.exports = router;
