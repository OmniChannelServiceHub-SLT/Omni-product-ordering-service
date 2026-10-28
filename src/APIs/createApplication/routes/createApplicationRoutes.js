const express = require("express");
const router = express.Router();

const {
    createApplicationController
} = require("../controllers/createApplicationController");

router.post("/", createApplicationController);

module.exports = router;