const express = require("express");

const {
  listAccountLinks
} = require("../controllers/listAccountLinkController");

const router = express.Router();

router.get("/", listAccountLinks);

module.exports = router;
