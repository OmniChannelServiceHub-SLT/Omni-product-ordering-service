const ProductOrder = require("../models/TMF622_ProductOrder");

async function createOperationProductOrder(productOrder) {
  return ProductOrder.create(productOrder);
}

module.exports = {
  createOperationProductOrder
};
