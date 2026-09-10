const express =
  require("express");

const router =
  express.Router();


const {
  createPackageActivation
} = require(
  "../controllers/packageActivationController"
);


router.post(
  "/",
  createPackageActivation
);


module.exports =
  router;