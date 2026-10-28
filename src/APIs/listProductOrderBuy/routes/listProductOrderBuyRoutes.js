
const express = require("express");
const router = express.Router();

const {
    listProductOrderBuyController
} = require("../controllers/listProductOrderBuyController");

router.get("/", listProductOrderBuyController);

module.exports = router;
