const express = require("express");

const {
  orderAddVasBundleInit
} = require(
  "../controllers/addVASDataBundlePrepaidInitController"
);

const router = express.Router();

router.post("/", orderAddVasBundleInit);

module.exports = router;
