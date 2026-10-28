const express = require("express");
const router = express.Router();

const {
    listCustConfirmation
} = require("../controllers/listCustConfirmationController");

router.get("/list-cust-confirmation", listCustConfirmation);

module.exports = router;
