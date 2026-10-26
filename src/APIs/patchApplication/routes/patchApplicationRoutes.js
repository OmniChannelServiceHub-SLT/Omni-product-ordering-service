const express = require("express");
const router = express.Router();

const {
    patchApplicationController
} = require("../controllers/patchApplicationController");

router.post("/", patchApplicationController);

module.exports = router;