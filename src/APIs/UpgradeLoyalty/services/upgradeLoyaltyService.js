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
    )
  };
}

function validateInput(data = {}) {
  const input = normalizeInput(data);

  if (String(input.subscriberId ?? "").trim() === "") {
    const error = new Error(
      "Missing required parameter(s): subscriberID"
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    subscriberId: String(input.subscriberId).trim()
  };
}

async function findActiveRequest(subscriberId) {
  return ProductOrder.findOne({
    legacyOperation: "UpgradeLoyalty",
    state: {
      $in: ["acknowledged", "pending", "inProgress"]
    },
    relatedParty: {
      $elemMatch: {
        id: subscriberId,
        role: "subscriber"
      }
    }
  });
}

function buildProductOrder(input) {
  return {
    externalId: `UPGRADE-LOYALTY-${Date.now()}`,
    description: "Loyalty upgrade request",
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
        action: "modify",
        state: "acknowledged",
        product: {
          productCharacteristic: [
            {
              name: "loyaltyUpgradeRequested",
              value: true,
              "@type": "BooleanCharacteristic"
            }
          ],
          "@type": "Product"
        },
        "@type": "ProductOrderItem"
      }
    ],
    legacyOperation: "UpgradeLoyalty",
    legacyPayload: {
      subscriberID: input.subscriberId
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
      message: "Loyalty upgrade request accepted",
      path: "/upgradeLoyalty",
      productOrderId: String(savedOrder._id)
    },
    errorShow: null,
    errorCode: null
  };
}

async function requestLoyalty(
  data,
  responseFormat = "tmf"
) {
  const input = validateInput(data);
  const activeRequest = await findActiveRequest(
    input.subscriberId
  );

  if (activeRequest) {
    const error = new Error(
      "A loyalty upgrade request is already in progress"
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
  requestLoyalty,
  normalizeInput,
  validateInput,
  findActiveRequest,
  buildProductOrder,
  buildTmfResponse,
  buildLegacyResponse
};
