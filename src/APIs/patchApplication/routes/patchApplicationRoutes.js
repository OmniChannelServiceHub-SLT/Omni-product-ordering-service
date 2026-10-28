const express = require("express");
const router = express.Router();

const {
    patchApplicationController
} = require("../controllers/patchApplicationController");

router.patch("/:REF_NO", patchApplicationController);

module.exports = router;