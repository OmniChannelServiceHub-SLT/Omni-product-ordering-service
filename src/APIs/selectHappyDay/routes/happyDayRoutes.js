const express = require("express");

const {
  createHappyDay
} = require("../controllers/happyDayController");

const router = express.Router();

router.post("/", createHappyDay);

module.exports = router;
