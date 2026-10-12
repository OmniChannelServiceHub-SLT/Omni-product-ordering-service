const ProductOrder = require(
  "../../../models/TMF622_ProductOrder"
);

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
        "@type": "RelatedParty"
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
      `/tmf-api/productOrderingManagement/v1/productOrder/${id}`,
    externalId: savedOrder.externalId,
    description: savedOrder.description,
    orderDate: savedOrder.createdAt,
    state: savedOrder.state,
    relatedParty: savedOrder.relatedParty || [],
    productOrderItem: savedOrder.productOrderItem || [],
    "@type": "ProductOrder"
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
  normalizeInput,
  validateInput,
  buildProductOrder,
  buildTmfResponse,
  buildLegacyResponse
};
