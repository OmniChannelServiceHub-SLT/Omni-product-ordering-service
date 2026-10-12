const express = require("express");

const {
  selectHappyDay
} = require(
  "../controllers/happydayController"
);

const router = express.Router();

router.post("/", selectHappyDay);

module.exports = router;
