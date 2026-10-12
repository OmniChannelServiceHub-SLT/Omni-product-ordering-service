const ProductOrder = require(
  "../../../models/TMF622_ProductOrder"
);

const TMF_PRODUCT_ORDER_PATH =
  "/tmf-api/productOrderingManagement/v4/productOrder";

const ORDER_ACTIONS = new Set([
  "add",
  "modify",
  "delete",
  "noChange"
]);

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function firstDefined(...values) {
  return values.find(
    (value) => value !== undefined && value !== null
  );
}

function normalizeInput(data = {}) {
  return {
    subscriberId: firstDefined(
      data.subscriberID,
      data.subscriberId,
      data.subscriberid
    ),
    voucherId: firstDefined(
      data.voucherid,
      data.voucherId,
      data.voucherID
    ),
    channel: data.channel
  };
}

function validateInput(data = {}) {
  const input = normalizeInput(data);
  const missingFields = [];

  if (String(input.subscriberId ?? "").trim() === "") {
    missingFields.push("subscriberID");
  }

  if (String(input.voucherId ?? "").trim() === "") {
    missingFields.push("voucherid");
  }

  if (String(input.channel ?? "").trim() === "") {
    missingFields.push("channel");
  }

  if (missingFields.length > 0) {
    const error = new Error(
      `Missing required parameter(s): ${missingFields.join(", ")}`
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    subscriberId: String(input.subscriberId).trim(),
    voucherId: String(input.voucherId).trim(),
    channel: String(input.channel).trim()
  };
}

function buildProductOrder(input) {
  return {
    externalId: `REDEEM-VOUCHER-${Date.now()}`,
    description: "Voucher redemption request",
    state: "acknowledged",
    relatedParty: [
      {
        id: input.subscriberId,
        role: "subscriber",
        "@type": "RelatedParty",
        "@referredType": "Individual"
      }
    ],
    productOrderItem: [
      {
        id: "1",
        action: "add",
        state: "acknowledged",
        product: {
          productCharacteristic: [
            {
              name: "voucherId",
              value: input.voucherId,
              "@type": "StringCharacteristic"
            },
            {
              name: "channel",
              value: input.channel,
              "@type": "StringCharacteristic"
            }
          ],
          "@type": "Product"
        },
        "@type": "ProductOrderItem"
      }
    ],
    legacyOperation: "RedeemVoucher",
    legacyPayload: {
      subscriberID: input.subscriberId,
      voucherid: input.voucherId,
      channel: input.channel
    },
    "@type": "ProductOrder"
  };
}

function buildTmfResponse(savedOrder) {
  if (!savedOrder || !savedOrder._id) {
    const error = new Error(
      "A saved ProductOrder with an id is required"
    );
    error.statusCode = 500;
    throw error;
  }

  const id = String(savedOrder._id);

  return {
    id,
    href:
      `${TMF_PRODUCT_ORDER_PATH}/${id}`,
    externalId: savedOrder.externalId,
    description: savedOrder.description,
    orderDate: savedOrder.createdAt,
    state: savedOrder.state,
    relatedParty: savedOrder.relatedParty || [],
    productOrderItem: savedOrder.productOrderItem || [],
    "@type": "ProductOrder"
  };
}

function validateTmfProductOrder(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw badRequest("A ProductOrder JSON object is required");
  }

  if (
    !Array.isArray(data.productOrderItem) ||
    data.productOrderItem.length === 0
  ) {
    throw badRequest(
      "productOrderItem is required and must contain at least one item"
    );
  }

  data.productOrderItem.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw badRequest(`productOrderItem[${index}] must be an object`);
    }

    if (String(item.id ?? "").trim() === "") {
      throw badRequest(`productOrderItem[${index}].id is required`);
    }

    if (!ORDER_ACTIONS.has(item.action)) {
      throw badRequest(
        `productOrderItem[${index}].action must be add, modify, delete or noChange`
      );
    }
  });

  if (data.relatedParty !== undefined) {
    if (!Array.isArray(data.relatedParty)) {
      throw badRequest("relatedParty must be an array");
    }

    data.relatedParty.forEach((party, index) => {
      if (!party || typeof party !== "object" || Array.isArray(party)) {
        throw badRequest(`relatedParty[${index}] must be an object`);
      }

      if (String(party.id ?? "").trim() === "") {
        throw badRequest(`relatedParty[${index}].id is required`);
      }

      if (String(party["@referredType"] ?? "").trim() === "") {
        throw badRequest(
          `relatedParty[${index}].@referredType is required`
        );
      }
    });
  }
}

function buildTmfProductOrder(data) {
  const productOrder = JSON.parse(JSON.stringify(data));

  [
    "id",
    "href",
    "orderDate",
    "state",
    "createdAt",
    "updatedAt",
    "_id",
    "__v",
    "legacyOperation",
    "legacyPayload"
  ].forEach((field) => delete productOrder[field]);

  productOrder.state = "acknowledged";
  productOrder.productOrderItem = productOrder.productOrderItem.map(
    (item) => ({
      ...item,
      state: "acknowledged"
    })
  );
  productOrder["@type"] = productOrder["@type"] || "ProductOrder";

  return productOrder;
}

function buildStandardTmfResponse(savedOrder) {
  if (!savedOrder || !savedOrder._id) {
    const error = new Error(
      "A saved ProductOrder with an id is required"
    );
    error.statusCode = 500;
    throw error;
  }

  const source = savedOrder.toObject
    ? savedOrder.toObject({ virtuals: false })
    : { ...savedOrder };
  const id = String(savedOrder._id);
  const orderDate = source.orderDate || savedOrder.createdAt;

  [
    "id",
    "href",
    "orderDate",
    "createdAt",
    "updatedAt",
    "_id",
    "__v",
    "legacyOperation",
    "legacyPayload"
  ].forEach((field) => delete source[field]);

  return {
    ...source,
    id,
    href: `${TMF_PRODUCT_ORDER_PATH}/${id}`,
    orderDate,
    "@type": source["@type"] || "ProductOrder"
  };
}

async function createTmfProductOrder(data) {
  validateTmfProductOrder(data);

  const productOrder = buildTmfProductOrder(data);
  const savedOrder = await ProductOrder.create(productOrder);

  return {
    statusCode: 201,
    body: buildStandardTmfResponse(savedOrder)
  };
}

function buildLegacyResponse(savedOrder) {
  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {
      status: "ACCEPTED",
      message: "Voucher redemption request accepted",
      path: "/redeemVoucher",
      productOrderId: String(savedOrder._id)
    },
    errorShow: null,
    errorCode: null
  };
}

async function redeemVoucher(
  data,
  responseFormat = "tmf"
) {
  const input = validateInput(data);
  const productOrder = buildProductOrder(input);
  const savedOrder = await ProductOrder.create(productOrder);

  if (responseFormat === "legacy") {
    return {
      statusCode: 200,
      body: buildLegacyResponse(savedOrder)
    };
  }

  return {
    statusCode: 201,
    body: buildTmfResponse(savedOrder)
  };
}

module.exports = {
  redeemVoucher,
  createTmfProductOrder,
  normalizeInput,
  validateInput,
  buildProductOrder,
  buildTmfResponse,
  buildLegacyResponse,
  validateTmfProductOrder,
  buildTmfProductOrder,
  buildStandardTmfResponse
};
