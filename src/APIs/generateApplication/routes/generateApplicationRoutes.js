const express = require("express");
const router = express.Router();

const {
    generateApplicationController
} = require("../controllers/generateApplicationController");

router.post("/", generateApplicationController);

module.exports = router;