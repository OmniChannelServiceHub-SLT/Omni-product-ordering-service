const express = require("express");

const {
  createOfferingQualification
} = require("../controllers/createOfferingController");

const router = express.Router();

router.get("/", createOfferingQualification);
router.post("/", createOfferingQualification);

module.exports = router;
