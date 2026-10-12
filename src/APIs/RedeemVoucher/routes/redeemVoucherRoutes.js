const express = require("express");

const {
  redeemVoucher,
  createTmfProductOrder,
  listTmfProductOrders,
  retrieveTmfProductOrder,
  updateTmfProductOrder,
  deleteTmfProductOrder
} = require(
  "../controllers/redeemVoucherController"
);

const router = express.Router();
const productOrderRouter = express.Router();

router.post("/", redeemVoucher);

productOrderRouter
  .route("/")
  .get(listTmfProductOrders)
  .post(createTmfProductOrder);

productOrderRouter
  .route("/:id")
  .get(retrieveTmfProductOrder)
  .patch(updateTmfProductOrder)
  .delete(deleteTmfProductOrder);

module.exports = router;
module.exports.productOrderRouter = productOrderRouter;
