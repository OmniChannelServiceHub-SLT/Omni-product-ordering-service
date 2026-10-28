const express = require("express");

const {
  createLteApplication
} = require("../controllers/createApplicationLteController");

const router = express.Router();

router.post("/", createLteApplication);

module.exports = router;
