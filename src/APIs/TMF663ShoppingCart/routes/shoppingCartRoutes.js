const express = require("express");
const {
  createShoppingCart,
  listShoppingCarts,
  retrieveShoppingCart,
  patchShoppingCart,
  deleteShoppingCart
} = require("../controllers/shoppingCartController");

const router = express.Router();

router.post("/", createShoppingCart);
router.get("/", listShoppingCarts);
router.get("/:id", retrieveShoppingCart);
router.patch("/:id", patchShoppingCart);
router.delete("/:id", deleteShoppingCart);

module.exports = router;
