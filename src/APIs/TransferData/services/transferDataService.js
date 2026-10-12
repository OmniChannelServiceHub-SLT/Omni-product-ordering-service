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
    receiverId: firstDefined(
      data.reciever,
      data.receiver,
      data.receiverId,
      data.receiverID
    ),
    volume: data.volume,
    unit: firstDefined(
      data.unit,
      data.volumeUnit,
      "GB"
    ),
    category: data.category,
    channel: data.channel
  };
}

function validateInput(data = {}) {
  const input = normalizeInput(data);
  const missingFields = [];

  if (String(input.subscriberId ?? "").trim() === "") {
    missingFields.push("subscriberID");
  }

  if (String(input.receiverId ?? "").trim() === "") {
    missingFields.push("reciever");
  }

  if (String(input.volume ?? "").trim() === "") {
    missingFields.push("volume");
  }

  if (String(input.category ?? "").trim() === "") {
    missingFields.push("category");
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

  const normalized = {
    subscriberId: String(input.subscriberId).trim(),
    receiverId: String(input.receiverId).trim(),
    volume: Number(input.volume),
    unit: String(input.unit).trim().toUpperCase(),
    category: String(input.category).trim(),
    channel: String(input.channel).trim()
  };

  if (
    normalized.subscriberId.toLowerCase() ===
    normalized.receiverId.toLowerCase()
  ) {
    const error = new Error(
      "subscriberID and reciever must identify different subscribers"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    !Number.isFinite(normalized.volume) ||
    normalized.volume <= 0
  ) {
    const error = new Error(
      "volume must be a positive number"
    );
    error.statusCode = 400;
    throw error;
  }

  if (normalized.unit === "") {
    const error = new Error("unit must not be empty");
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

async function findActiveTransfer(input) {
  return ProductOrder.findOne({
    legacyOperation: "TransferData",
    state: {
      $in: ["acknowledged", "pending", "inProgress"]
    },
    "legacyPayload.subscriberID": input.subscriberId,
    "legacyPayload.reciever": input.receiverId
  });
}

function buildProductOrder(input) {
  return {
    externalId: `DATA-TRANSFER-${Date.now()}`,
    description: "Data transfer request pending validation",
    state: "pending",
    relatedParty: [
      {
        id: input.subscriberId,
        role: "sender",
        "@type": "RelatedParty"
      },
      {
        id: input.receiverId,
        role: "receiver",
        "@type": "RelatedParty"
      }
    ],
    productOrderItem: [
      {
        id: "1",
        action: "modify",
        state: "pending",
        product: {
          productCharacteristic: [
            {
              name: "receiverLogicalResource",
              value: input.receiverId,
              "@type": "StringCharacteristic"
            },
            {
              name: "receiverBucketUsageType",
              value: input.category,
              "@type": "StringCharacteristic"
            },
            {
              name: "usageType",
              value: input.category,
              "@type": "StringCharacteristic"
            },
            {
              name: "transferAmount",
              value: {
                amount: input.volume,
                units: input.unit
              },
              "@type": "ObjectCharacteristic"
            },
            {
              name: "channel",
              value: input.channel,
              "@type": "StringCharacteristic"
            },
            {
              name: "reason",
              value: "Customer initiated data transfer",
              "@type": "StringCharacteristic"
            }
          ],
          "@type": "Product"
        },
        "@type": "ProductOrderItem"
      }
    ],
    transferValidation: {
      state: "pendingProviderValidation",
      senderBucketResolved: false,
      receiverBucketResolved: false
    },
    legacyOperation: "TransferData",
    legacyPayload: {
      subscriberID: input.subscriberId,
      category: input.category,
      channel: input.channel,
      volume: input.volume,
      unit: input.unit,
      reciever: input.receiverId
    },
    "@type": "ProductOrder"
  };
}

function buildTmfResponse(savedOrder) {
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
    transferValidation:
      savedOrder.transferValidation || {
        state: "pendingProviderValidation"
      },
    "@type": "ProductOrder"
  };
}

function buildLegacyResponse(savedOrder) {
  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {
      status: "PENDING_VALIDATION",
      message:
        "Data transfer request accepted and awaiting eligibility validation",
      path: "/transferData",
      productOrderId: String(savedOrder._id)
    },
    errorShow: null,
    errorCode: null
  };
}

async function createTransfer(
  data,
  responseFormat = "tmf"
) {
  const input = validateInput(data);
  const activeTransfer = await findActiveTransfer(input);

  if (activeTransfer) {
    const error = new Error(
      "A data transfer request between these subscribers is already in progress"
    );
    error.statusCode = 409;
    throw error;
  }

  const productOrder = buildProductOrder(input);
  const savedOrder = await ProductOrder.create(productOrder);

  if (responseFormat === "legacy") {
    return {
      statusCode: 200,
      body: buildLegacyResponse(savedOrder)
    };
  }

  return {
    statusCode: 202,
    body: buildTmfResponse(savedOrder)
  };
}

module.exports = {
  createTransfer,
  normalizeInput,
  validateInput,
  findActiveTransfer,
  buildProductOrder,
  buildTmfResponse,
  buildLegacyResponse
};
