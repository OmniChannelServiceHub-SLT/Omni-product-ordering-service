const express = require("express");

const {
  redeemVoucher,
  createTmfProductOrder
} = require(
  "../controllers/redeemVoucherController"
);

const router = express.Router();
const productOrderRouter = express.Router();

router.post("/", redeemVoucher);
productOrderRouter.post("/", createTmfProductOrder);

module.exports = router;
module.exports.productOrderRouter = productOrderRouter;
