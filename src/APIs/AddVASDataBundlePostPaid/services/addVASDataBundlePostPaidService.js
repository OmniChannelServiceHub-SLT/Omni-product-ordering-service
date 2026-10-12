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
    packageId: firstDefined(
      data.packageId,
      data.packageid,
      data.packageID
    ),
    commitUser: firstDefined(
      data.commitUser,
      data.commituser
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

  if (String(input.packageId ?? "").trim() === "") {
    missingFields.push("packageId");
  }

  if (String(input.commitUser ?? "").trim() === "") {
    missingFields.push("commitUser");
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
    packageId: String(input.packageId).trim(),
    commitUser: String(input.commitUser).trim(),
    channel: String(input.channel).trim()
  };
}

function buildProductOrder(input) {
  return {
    externalId: `VAS-DATA-BUNDLE-POSTPAID-${Date.now()}`,
    description: "Postpaid VAS data bundle order",
    state: "acknowledged",
    relatedParty: [
      {
        id: input.subscriberId,
        role: "subscriber",
        "@type": "RelatedParty"
      },
      {
        id: input.commitUser,
        role: "requestor",
        "@type": "RelatedParty"
      }
    ],
    productOrderItem: [
      {
        id: "1",
        action: "add",
        state: "acknowledged",
        product: {
          productOffering: {
            id: input.packageId,
            "@type": "ProductOfferingRef"
          },
          productCharacteristic: [
            {
              name: "channel",
              value: input.channel,
              "@type": "StringCharacteristic"
            },
            {
              name: "commitUser",
              value: input.commitUser,
              "@type": "StringCharacteristic"
            }
          ],
          "@type": "Product"
        },
        "@type": "ProductOrderItem"
      }
    ],
    legacyOperation: "AddVASDataBundlePostPaid",
    legacyPayload: {
      subscriberID: input.subscriberId,
      packageId: input.packageId,
      commitUser: input.commitUser,
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
      message: "Postpaid VAS data bundle order accepted",
      path: "/provisionPackage",
      productOrderId: String(savedOrder._id)
    },
    errorShow: null,
    errorCode: null
  };
}

async function orderAddVasBundle(
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
  orderAddVasBundle,
  normalizeInput,
  validateInput,
  buildProductOrder,
  buildTmfResponse,
  buildLegacyResponse
};
