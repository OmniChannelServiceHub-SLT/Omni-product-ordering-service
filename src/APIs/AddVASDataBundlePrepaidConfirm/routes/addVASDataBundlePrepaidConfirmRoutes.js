const express = require("express");

const {
  confirmAddVasBundle
} = require(
  "../controllers/addVASDataBundlePrepaidConfirmController"
);

const router = express.Router();

router.post("/", confirmAddVasBundle);

module.exports = router;
