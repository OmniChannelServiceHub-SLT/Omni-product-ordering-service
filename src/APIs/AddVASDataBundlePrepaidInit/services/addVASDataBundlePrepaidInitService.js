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
    channel: data.channel,
    callbackUrl: firstDefined(
      data.url,
      data.callbackUrl
    )
  };
}

function isValidCallbackUrl(value) {
  try {
    const parsedUrl = new URL(value);
    return (
      parsedUrl.protocol === "http:" ||
      parsedUrl.protocol === "https:"
    );
  } catch (error) {
    return false;
  }
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

  if (String(input.callbackUrl ?? "").trim() === "") {
    missingFields.push("url");
  }

  if (missingFields.length > 0) {
    const error = new Error(
      `Missing required parameter(s): ${missingFields.join(", ")}`
    );
    error.statusCode = 400;
    throw error;
  }

  const normalized = {
    subscriberId: String(input.subscriberId).trim(),
    packageId: String(input.packageId).trim(),
    commitUser: String(input.commitUser).trim(),
    channel: String(input.channel).trim(),
    callbackUrl: String(input.callbackUrl).trim()
  };

  if (!isValidCallbackUrl(normalized.callbackUrl)) {
    const error = new Error(
      "url must be a valid absolute HTTP or HTTPS URL"
    );
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

function buildProductOrder(input) {
  return {
    externalId: `VAS-DATA-BUNDLE-PREPAID-INIT-${Date.now()}`,
    description: "Prepaid VAS data bundle initialization",
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
            },
            {
              name: "callbackUrl",
              value: input.callbackUrl,
              "@type": "StringCharacteristic"
            }
          ],
          "@type": "Product"
        },
        "@type": "ProductOrderItem"
      }
    ],
    legacyOperation: "AddVASDataBundlePrepaidInit",
    legacyPayload: {
      subscriberID: input.subscriberId,
      packageId: input.packageId,
      commitUser: input.commitUser,
      channel: input.channel,
      url: input.callbackUrl
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
      message: "Prepaid VAS data bundle initialization accepted",
      path: "/initiatePrePaidProvisioning",
      productOrderId: String(savedOrder._id)
    },
    errorShow: null,
    errorCode: null
  };
}

async function orderAddVasBundleInit(
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
  orderAddVasBundleInit,
  normalizeInput,
  validateInput,
  isValidCallbackUrl,
  buildProductOrder,
  buildTmfResponse,
  buildLegacyResponse
};
