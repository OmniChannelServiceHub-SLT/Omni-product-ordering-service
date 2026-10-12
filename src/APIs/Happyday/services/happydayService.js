const ProductOrder = require(
  "../../../models/TMF622_ProductOrder"
);

const TMF_PRODUCT_ORDER_PATH =
  "/tmf-api/productOrderingManagement/v4/productOrder";

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
    happyDate: firstDefined(
      data.happydate,
      data.happyDate
    ),
    channel: data.channel,
    commitUser: firstDefined(
      data.commituser,
      data.commitUser
    )
  };
}

function isValidDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);
  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateInput(data = {}) {
  const input = normalizeInput(data);
  const missingFields = [];

  if (String(input.subscriberId ?? "").trim() === "") {
    missingFields.push("subscriberID");
  }

  if (String(input.happyDate ?? "").trim() === "") {
    missingFields.push("happydate");
  }

  if (String(input.channel ?? "").trim() === "") {
    missingFields.push("channel");
  }

  if (String(input.commitUser ?? "").trim() === "") {
    missingFields.push("commituser");
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
    happyDate: String(input.happyDate).trim(),
    channel: String(input.channel).trim(),
    commitUser: String(input.commitUser).trim()
  };

  if (!isValidDateOnly(normalized.happyDate)) {
    const error = new Error(
      "happydate must be a valid date in YYYY-MM-DD format"
    );
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

function buildProductOrder(input) {
  return {
    externalId: `HAPPY-DAY-${Date.now()}`,
    description: "HappyDay selection request",
    state: "acknowledged",
    relatedParty: [
      {
        id: input.subscriberId,
        role: "subscriber",
        "@type": "RelatedParty",
        "@referredType": "Individual"
      },
      {
        id: input.commitUser,
        role: "requestor",
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
              name: "happyDate",
              value: input.happyDate,
              "@type": "StringCharacteristic"
            },
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
    legacyOperation: "HappyDay",
    legacyPayload: {
      subscriberID: input.subscriberId,
      happydate: input.happyDate,
      channel: input.channel,
      commituser: input.commitUser
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

function buildLegacyResponse(savedOrder) {
  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {
      status: "ACCEPTED",
      message: "HappyDay selection request accepted",
      path: "/happyDay",
      productOrderId: String(savedOrder._id)
    },
    errorShow: null,
    errorCode: null
  };
}

async function selectHappyDay(
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
  selectHappyDay,
  normalizeInput,
  validateInput,
  isValidDateOnly,
  buildProductOrder,
  buildTmfResponse,
  buildLegacyResponse
};
