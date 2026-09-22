const express = require("express");

const router = express.Router();

const {
    validateGataGifSub
} = require(
    "../controllers/validateGataGifSubController"
);

router.get(
    "/validate-gata-gif-sub",
    validateGataGifSub
);

module.exports = router;