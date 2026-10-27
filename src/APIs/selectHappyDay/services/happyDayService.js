const {
  createOperationProductOrder
} = require("../../../services/productOrderService");

const {
  isEntitledPrincipal
} = require("../../listAccountLink/services/listAccountLinkService");

const TMF_BASE_PATH =
  "/tmf-api/productOrderingManagement/v4/productOrder";

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function firstDefined(...values) {
  return values.find(
    (value) => value !== undefined && value !== null
  );
}

function normalizeInput(data = {}) {
  const input = {
    subscriberId: String(
      firstDefined(
        data.subscriberID,
        data.subscriberId,
        data.subscriberid
      ) ?? ""
    ).trim(),
    happyDate: String(
      firstDefined(data.happydate, data.happyDate) ?? ""
    ).trim(),
    channel: String(data.channel ?? "").trim(),
    commitUser: String(
      firstDefined(data.commituser, data.commitUser) ?? ""
    ).trim()
  };
  const missingFields = [];

  if (!input.subscriberId) {
    missingFields.push("subscriberID");
  }

  if (!input.happyDate) {
    missingFields.push("happydate");
  }

  if (!input.channel) {
    missingFields.push("channel");
  }

  if (!input.commitUser) {
    missingFields.push("commituser");
  }

  if (missingFields.length > 0) {
    throw httpError(
      400,
      `Missing required parameter(s): ${missingFields.join(", ")}`
    );
  }

  if (!/^[A-Za-z0-9._+-]{5,32}$/.test(input.subscriberId)) {
    throw httpError(400, "subscriberID has an invalid format");
  }

  if (!isValidIsoDate(input.happyDate)) {
    throw httpError(
      400,
      "happydate must be a valid calendar date in YYYY-MM-DD format"
    );
  }

  return input;
}

function isValidIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function buildProductOrder(input, principal = {}) {
  const requestor =
    principal.sub || principal.userName || principal.username;
  const relatedParty = [
    {
      id: input.subscriberId,
      role: "subscriber",
      "@type": "RelatedParty"
    },
    {
      id: input.commitUser,
      role: "commitUser",
      "@type": "RelatedParty"
    }
  ];

  if (requestor && String(requestor) !== input.commitUser) {
    relatedParty.push({
      id: String(requestor),
      role: "requestor",
      "@type": "RelatedParty"
    });
  }

  const productOffering = {
    id: "HAPPY_DAY",
    name: "Happy Day",
    "@type": "ProductOfferingRef"
  };

  return {
    externalId: `HAPPY-DAY-${Date.now()}`,
    description: `Happy Day selection for ${input.happyDate}`,
    state: "acknowledged",
    relatedParty,
    productOrderItem: [
      {
        id: "1",
        action: "modify",
        state: "acknowledged",
        productOffering,
        product: {
          productOffering,
          productCharacteristic: [
            {
              name: "happyDate",
              value: input.happyDate,
              "@type": "DateCharacteristic"
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
  const id = String(savedOrder?._id || savedOrder?.id);

  if (!id || id === "undefined") {
    throw httpError(500, "Saved Happy Day product order id is missing");
  }

  return {
    id,
    href: `${TMF_BASE_PATH}/${encodeURIComponent(id)}`,
    externalId: savedOrder.externalId,
    description: savedOrder.description,
    orderDate: savedOrder.createdAt,
    state: savedOrder.state || "acknowledged",
    relatedParty: savedOrder.relatedParty || [],
    productOrderItem: savedOrder.productOrderItem || [],
    "@type": "ProductOrder"
  };
}

function buildLegacyResponse(savedOrder, happyDate) {
  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {
      status: "ACCEPTED",
      message:
        `Happy Day selection for ${happyDate} accepted; ` +
        "provider scheduling is pending",
      path: "",
      productOrderId: String(savedOrder._id || savedOrder.id)
    },
    errorShow: null,
    errorCode: null
  };
}

async function selectHappyDay({
  data,
  principal,
  responseFormat = "tmf"
} = {}) {
  const input = normalizeInput(data);

  if (!isEntitledPrincipal(principal, input.subscriberId)) {
    throw httpError(
      403,
      "The authenticated principal is not entitled to this subscriber"
    );
  }

  const productOrder = buildProductOrder(input, principal);
  const savedOrder = await createOperationProductOrder(productOrder);

  return responseFormat === "legacy"
    ? {
        statusCode: 200,
        body: buildLegacyResponse(savedOrder, input.happyDate)
      }
    : {
        statusCode: 201,
        body: buildTmfResponse(savedOrder)
      };
}

module.exports = {
  selectHappyDay,
  normalizeInput,
  isValidIsoDate,
  buildProductOrder,
  buildTmfResponse,
  buildLegacyResponse
};
