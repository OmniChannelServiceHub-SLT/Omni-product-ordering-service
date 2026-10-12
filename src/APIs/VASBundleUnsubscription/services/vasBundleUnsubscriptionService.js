const ProductOrder = require(
  "../../../models/TMF622_ProductOrder"
);

const {
  createOperationProductOrder
} = require(
  "../../RedeemVoucher/services/redeemVoucherService"
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
    timestamp: data.timestamp,
    subscriptionId: firstDefined(
      data.subscriptionid,
      data.subscriptionId,
      data.subscriptionID
    )
  };
}

function validateInput(data = {}) {
  const input = normalizeInput(data);
  const missingFields = [];

  if (String(input.subscriberId ?? "").trim() === "") {
    missingFields.push("subscriberID");
  }

  if (String(input.timestamp ?? "").trim() === "") {
    missingFields.push("timestamp");
  }

  if (String(input.subscriptionId ?? "").trim() === "") {
    missingFields.push("subscriptionid");
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
    timestamp: String(input.timestamp).trim(),
    subscriptionId: String(input.subscriptionId).trim()
  };
}

async function findActiveRequest(input) {
  return ProductOrder.findOne({
    legacyOperation: "VASBundleUnsubscription",
    state: {
      $in: ["acknowledged", "pending", "inProgress"]
    },
    "legacyPayload.subscriberID": input.subscriberId,
    "legacyPayload.subscriptionid": input.subscriptionId
  });
}

function buildProductOrder(input) {
  return {
    externalId: `VAS-BUNDLE-UNSUBSCRIPTION-${Date.now()}`,
    description: "VAS bundle unsubscription request",
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
        action: "delete",
        state: "acknowledged",
        product: {
          id: input.subscriptionId,
          productCharacteristic: [
            {
              name: "requestTimestamp",
              value: input.timestamp,
              "@type": "StringCharacteristic"
            }
          ],
          "@type": "Product"
        },
        "@type": "ProductOrderItem"
      }
    ],
    legacyOperation: "VASBundleUnsubscription",
    legacyPayload: {
      subscriberID: input.subscriberId,
      timestamp: input.timestamp,
      subscriptionid: input.subscriptionId
    },
    "@type": "ProductOrder"
  };
}

function buildTmfResponse(savedOrder) {
  const id = String(savedOrder._id);

  return {
    id,
    href:
      `/tmf-api/productOrderingManagement/v4/productOrder/${id}`,
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
      message: "VAS bundle unsubscription request accepted",
      path: "/unsubscribe",
      productOrderId: String(savedOrder._id)
    },
    errorShow: null,
    errorCode: null
  };
}

async function orderVasBundle(
  data,
  responseFormat = "tmf"
) {
  const input = validateInput(data);
  const activeRequest = await findActiveRequest(input);

  if (activeRequest) {
    const error = new Error(
      "A VAS bundle unsubscription request is already in progress"
    );
    error.statusCode = 409;
    throw error;
  }

  const productOrder = buildProductOrder(input);
  const savedOrder = await createOperationProductOrder(productOrder);

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
  orderVasBundle,
  normalizeInput,
  validateInput,
  findActiveRequest,
  buildProductOrder,
  buildTmfResponse,
  buildLegacyResponse
};
