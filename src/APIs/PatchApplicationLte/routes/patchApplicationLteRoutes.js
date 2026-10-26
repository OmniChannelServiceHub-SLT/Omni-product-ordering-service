const express = require("express");

const {
  patchLteApplication
} = require("../controllers/patchApplicationLteController");

const patchRouter = express.Router();
const legacyPostRouter = express.Router();

patchRouter.patch("/", patchLteApplication);
patchRouter.patch("/:refNo", patchLteApplication);
legacyPostRouter.post("/", patchLteApplication);

module.exports = {
  patchRouter,
  legacyPostRouter
};
