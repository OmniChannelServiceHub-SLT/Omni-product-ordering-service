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
    accessType: data.type,
    customerName: data.name,
    nic: data.nic,
    contactMobile: firstDefined(
      data.contactMobile,
      data.contactmobile
    ),
    email: data.email,
    existingPackage: firstDefined(
      data.exsistingPackage,
      data.existingPackage
    ),
    newPackage: firstDefined(
      data.newPackage,
      data.newpackage
    ),
    currentMonthlyValue: firstDefined(
      data.currentMonthlyValue,
      data.currentmonthlyvalue
    ),
    newMonthlyValue: firstDefined(
      data.newMonthlyValue,
      data.newmonthlyvalue
    ),
    changeType: firstDefined(
      data.changeType,
      data.changetype
    )
  };
}

function validateInput(data = {}) {
  const input = normalizeInput(data);
  const requiredFields = [
    ["subscriberID", input.subscriberId],
    ["type", input.accessType],
    ["name", input.customerName],
    ["nic", input.nic],
    ["contactMobile", input.contactMobile],
    ["email", input.email],
    ["exsistingPackage", input.existingPackage],
    ["newPackage", input.newPackage],
    ["currentMonthlyValue", input.currentMonthlyValue],
    ["newMonthlyValue", input.newMonthlyValue],
    ["changeType", input.changeType]
  ];

  const missingFields = requiredFields
    .filter(([, value]) =>
      String(value ?? "").trim() === ""
    )
    .map(([name]) => name);

  if (missingFields.length > 0) {
    const error = new Error(
      `Missing required parameter(s): ${missingFields.join(", ")}`
    );
    error.statusCode = 400;
    throw error;
  }

  const normalized = {
    subscriberId: String(input.subscriberId).trim(),
    accessType: String(input.accessType).trim(),
    customerName: String(input.customerName).trim(),
    nic: String(input.nic).trim(),
    contactMobile: String(input.contactMobile).trim(),
    email: String(input.email).trim(),
    existingPackage: String(input.existingPackage).trim(),
    newPackage: String(input.newPackage).trim(),
    currentMonthlyValue: Number(input.currentMonthlyValue),
    newMonthlyValue: Number(input.newMonthlyValue),
    changeType: String(input.changeType).trim()
  };

  if (
    !Number.isFinite(normalized.currentMonthlyValue) ||
    normalized.currentMonthlyValue < 0
  ) {
    const error = new Error(
      "currentMonthlyValue must be a non-negative number"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    !Number.isFinite(normalized.newMonthlyValue) ||
    normalized.newMonthlyValue < 0
  ) {
    const error = new Error(
      "newMonthlyValue must be a non-negative number"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    normalized.existingPackage.toLowerCase() ===
    normalized.newPackage.toLowerCase()
  ) {
    const error = new Error(
      "newPackage must differ from exsistingPackage"
    );
    error.statusCode = 400;
    throw error;
  }

  const changeType = normalized.changeType.toLowerCase();

  if (
    changeType === "downgrade" &&
    normalized.newMonthlyValue >=
      normalized.currentMonthlyValue
  ) {
    const error = new Error(
      "newMonthlyValue must be lower for a Downgrade"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    changeType === "upgrade" &&
    normalized.newMonthlyValue <=
      normalized.currentMonthlyValue
  ) {
    const error = new Error(
      "newMonthlyValue must be higher for an Upgrade"
    );
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

async function findActiveRequest(subscriberId) {
  return ProductOrder.findOne({
    legacyOperation: "BBPackageChangeRequest",
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
    externalId: `BB-PACKAGE-CHANGE-${Date.now()}`,
    description:
      `Broadband package ${input.changeType}: ` +
      `${input.existingPackage} to ${input.newPackage}`,
    state: "acknowledged",
    relatedParty: [
      {
        id: input.subscriberId,
        role: "subscriber",
        name: input.customerName,
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
          productOffering: {
            id: input.newPackage,
            name: input.newPackage,
            "@type": "ProductOfferingRef"
          },
          productCharacteristic: [
            {
              name: "accessType",
              value: input.accessType,
              "@type": "StringCharacteristic"
            },
            {
              name: "existingPackage",
              value: input.existingPackage,
              "@type": "StringCharacteristic"
            },
            {
              name: "changeType",
              value: input.changeType,
              "@type": "StringCharacteristic"
            },
            {
              name: "currentMonthlyValue",
              value: input.currentMonthlyValue,
              "@type": "NumberCharacteristic"
            },
            {
              name: "newMonthlyValue",
              value: input.newMonthlyValue,
              "@type": "NumberCharacteristic"
            }
          ],
          "@type": "Product"
        },
        "@type": "ProductOrderItem"
      }
    ],
    contactMedium: [
      {
        mediumType: "telephone",
        characteristic: {
          phoneNumber: input.contactMobile
        },
        "@type": "ContactMedium"
      },
      {
        mediumType: "email",
        characteristic: {
          emailAddress: input.email
        },
        "@type": "ContactMedium"
      }
    ],
    legacyOperation: "BBPackageChangeRequest",
    legacyPayload: {
      subscriberID: input.subscriberId,
      type: input.accessType,
      name: input.customerName,
      nic: input.nic,
      contactMobile: input.contactMobile,
      email: input.email,
      exsistingPackage: input.existingPackage,
      newPackage: input.newPackage,
      currentMonthlyValue: input.currentMonthlyValue,
      newMonthlyValue: input.newMonthlyValue,
      changeType: input.changeType
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
      isSuccess: "true",
      value: "package change request accepted",
      productOrderId: String(savedOrder._id)
    },
    errorShow: null,
    errorCode: null
  };
}

async function orderBbPackageChange(
  data,
  responseFormat = "tmf"
) {
  const input = validateInput(data);
  const activeRequest = await findActiveRequest(
    input.subscriberId
  );

  if (activeRequest) {
    const error = new Error(
      "A package change request is already in progress"
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
  orderBbPackageChange,
  normalizeInput,
  validateInput,
  findActiveRequest,
  buildProductOrder,
  buildTmfResponse,
  buildLegacyResponse
};
