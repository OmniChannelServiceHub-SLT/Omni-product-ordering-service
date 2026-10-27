const express = require("express");
const {
  createProductOrder,
  listProductOrders,
  retrieveProductOrder,
  patchProductOrder,
  deleteProductOrder
} = require("../controllers/productOrderController");

const router = express.Router();

router.post("/", createProductOrder);
router.get("/", listProductOrders);
router.get("/:id", retrieveProductOrder);
router.patch("/:id", patchProductOrder);
router.delete("/:id", deleteProductOrder);

module.exports = router;
