const express = require("express");

const {
  retrieveLteApplication
} = require("../controllers/retrieveApplicationLteController");

const router = express.Router();

router.get("/", retrieveLteApplication);
router.get("/:refNo", retrieveLteApplication);

module.exports = router;
