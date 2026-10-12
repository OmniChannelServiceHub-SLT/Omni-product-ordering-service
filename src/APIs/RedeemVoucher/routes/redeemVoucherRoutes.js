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

function methodNotAllowed(req, res) {
  return res.status(405).json({
    code: "405",
    reason: "Method Not Allowed",
    message: `Method ${req.method} is not allowed for ${req.originalUrl}`,
    status: "405",
    "@type": "Error"
  });
}

router.post("/", redeemVoucher);

productOrderRouter
  .route("/")
  .get(listTmfProductOrders)
  .post(createTmfProductOrder)
  .all(methodNotAllowed);

productOrderRouter
  .route("/:id")
  .get(retrieveTmfProductOrder)
  .patch(updateTmfProductOrder)
  .delete(deleteTmfProductOrder)
  .all(methodNotAllowed);

module.exports = router;
module.exports.productOrderRouter = productOrderRouter;
