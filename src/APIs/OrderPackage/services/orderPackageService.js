const {
  createOperationProductOrder
} = require("../../../services/productOrderService");

const {
  isEntitledPrincipal
} = require("../../ListAccountLink/services/listAccountLinkService");

const TMF_BASE_PATH =
  "/tmf-api/productOrderingManagement/v4/productOrder";

const DEFAULT_PACKAGE_CATALOG = Object.freeze({
  "1": {
    name: "TimelyPay Package 1",
    productSpecificationId: "TIMELYPAY"
  }
});

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
  const telephoneNo = String(
    firstDefined(
      data.telephoneno,
      data.telephoneNo,
      data.telephone,
      data.subscriberID
    ) ?? ""
  ).trim();
  const packageId = String(
    firstDefined(data.packageid, data.packageId, data.packageID) ?? ""
  ).trim();
  const receiver = String(
    firstDefined(
      data.receiver,
      data.receiverId,
      data.receiverID,
      telephoneNo
    ) ?? ""
  ).trim();
  const channel = String(data.channel ?? "OMNI").trim() || "OMNI";

  if (!telephoneNo) {
    throw httpError(400, "telephoneno is required");
  }

  if (!/^\+?[0-9]{7,15}$/.test(telephoneNo)) {
    throw httpError(
      400,
      "telephoneno must contain 7 to 15 digits with an optional leading +"
    );
  }

  if (!packageId) {
    throw httpError(400, "packageid is required");
  }

  if (receiver && !/^\+?[0-9]{7,15}$/.test(receiver)) {
    throw httpError(
      400,
      "receiver must contain 7 to 15 digits with an optional leading +"
    );
  }

  return {
    telephoneNo,
    packageId,
    receiver,
    channel
  };
}

function loadPackageCatalog() {
  const configured = process.env.PACKAGE_CATALOG_JSON;

  if (!configured) {
    return DEFAULT_PACKAGE_CATALOG;
  }

  let parsed;

  try {
    parsed = JSON.parse(configured);
  } catch (error) {
    throw httpError(500, "PACKAGE_CATALOG_JSON is not valid JSON");
  }

  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw httpError(
      500,
      "PACKAGE_CATALOG_JSON must be an object keyed by package id"
    );
  }

  return parsed;
}

function getPackage(packageId) {
  const packageDefinition = loadPackageCatalog()[packageId];

  if (!packageDefinition) {
    throw httpError(404, `Package ${packageId} was not found`);
  }

  if (
    Array.isArray(packageDefinition) ||
    typeof packageDefinition !== "object"
  ) {
    throw httpError(500, `Package ${packageId} configuration is invalid`);
  }

  return {
    id: packageId,
    name: String(packageDefinition.name ?? `Package ${packageId}`),
    productSpecificationId: String(
      packageDefinition.productSpecificationId ?? packageId
    )
  };
}

function buildProductOrder(input, packageDefinition, principal = {}) {
  const productOffering = {
    id: packageDefinition.id,
    name: packageDefinition.name,
    "@type": "ProductOfferingRef"
  };
  const relatedParty = [
    {
      id: input.telephoneNo,
      role: "subscriber",
      "@type": "RelatedParty"
    }
  ];

  if (input.receiver !== input.telephoneNo) {
    relatedParty.push({
      id: input.receiver,
      role: "receiver",
      "@type": "RelatedParty"
    });
  }

  const requestor = principal.sub || principal.userName || principal.username;

  if (requestor) {
    relatedParty.push({
      id: String(requestor),
      role: "requestor",
      "@type": "RelatedParty"
    });
  }

  return {
    externalId: `PACKAGE-${Date.now()}`,
    description: `Activate ${packageDefinition.name}`,
    state: "acknowledged",
    relatedParty,
    productOrderItem: [
      {
        id: "1",
        action: "add",
        state: "acknowledged",
        productOffering,
        product: {
          productOffering,
          productSpecification: {
            id: packageDefinition.productSpecificationId,
            "@type": "ProductSpecificationRef"
          },
          productCharacteristic: [
            {
              name: "channel",
              value: input.channel,
              "@type": "StringCharacteristic"
            },
            {
              name: "receiverTelephoneNo",
              value: input.receiver,
              "@type": "StringCharacteristic"
            }
          ],
          "@type": "Product"
        },
        "@type": "ProductOrderItem"
      }
    ],
    legacyOperation: "packageActivation",
    legacyPayload: {
      telephoneno: input.telephoneNo,
      packageid: input.packageId,
      receiver: input.receiver,
      channel: input.channel
    },
    "@type": "ProductOrder"
  };
}

function buildTmfResponse(savedOrder) {
  const id = String(savedOrder._id || savedOrder.id);

  if (!id || id === "undefined") {
    throw httpError(500, "Saved product order id is missing");
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

function buildLegacyResponse(savedOrder) {
  const id = String(savedOrder._id || savedOrder.id);

  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {
      result: "Pending",
      resultDesc: "Product order accepted for downstream fulfillment",
      productOrderId: id
    },
    errorShow: null,
    errorCode: null
  };
}

async function orderPackage({
  data,
  principal,
  responseFormat = "tmf"
} = {}) {
  const input = normalizeInput(data);

  if (!isEntitledPrincipal(principal, input.telephoneNo)) {
    throw httpError(
      403,
      "The authenticated principal is not entitled to this telephone number"
    );
  }

  const packageDefinition = getPackage(input.packageId);
  const productOrder = buildProductOrder(
    input,
    packageDefinition,
    principal
  );
  const savedOrder = await createOperationProductOrder(productOrder);

  return responseFormat === "legacy"
    ? {
        statusCode: 200,
        body: buildLegacyResponse(savedOrder)
      }
    : {
        statusCode: 201,
        body: buildTmfResponse(savedOrder)
      };
}

module.exports = {
  orderPackage,
  normalizeInput,
  getPackage,
  buildProductOrder,
  buildTmfResponse,
  buildLegacyResponse
};
