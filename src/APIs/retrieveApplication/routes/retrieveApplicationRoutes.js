const express = require("express");
const router = express.Router();

const {
    retrieveApplicationController
} = require("../controllers/retrieveApplicationController");

router.get("/", retrieveApplicationController);

module.exports = router;