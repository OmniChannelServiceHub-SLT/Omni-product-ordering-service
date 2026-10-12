const mongoose = require("mongoose");

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
    purchaseId: firstDefined(
      data.purchaseID,
      data.purchaseId,
      data.purchaseid
    ),
    payId: firstDefined(
      data.payId,
      data.payID,
      data.payid
    ),
    pgResponseCode: firstDefined(
      data.pgResponseCode,
      data.pgresponsecode
    ),
    paymentData: data.data
  };
}

function validateInput(data = {}) {
  const input = normalizeInput(data);
  const missingFields = [];

  if (String(input.subscriberId ?? "").trim() === "") {
    missingFields.push("subscriberID");
  }

  if (String(input.purchaseId ?? "").trim() === "") {
    missingFields.push("purchaseID");
  }

  if (String(input.payId ?? "").trim() === "") {
    missingFields.push("payId");
  }

  if (String(input.pgResponseCode ?? "").trim() === "") {
    missingFields.push("pgResponseCode");
  }

  if (String(input.paymentData ?? "").trim() === "") {
    missingFields.push("data");
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
    purchaseId: String(input.purchaseId).trim(),
    payId: String(input.payId).trim(),
    pgResponseCode: String(input.pgResponseCode).trim(),
    paymentData: String(input.paymentData).trim()
  };
}

async function findProductOrder(input) {
  const references = [
    { externalId: input.purchaseId },
    { "legacyPayload.purchaseID": input.purchaseId },
    { "payment.purchaseID": input.purchaseId }
  ];

  if (mongoose.isValidObjectId(input.purchaseId)) {
    references.unshift({ _id: input.purchaseId });
  }

  return ProductOrder.findOne({
    $and: [
      { $or: references },
      {
        relatedParty: {
          $elemMatch: {
            id: input.subscriberId,
            role: "subscriber"
          }
        }
      }
    ]
  });
}

function toPlainObject(value) {
  if (!value) {
    return {};
  }

  if (typeof value.toObject === "function") {
    return value.toObject();
  }

  return { ...value };
}

async function applyPaymentConfirmation(order, input) {
  order.legacyPayload = {
    ...toPlainObject(order.legacyPayload),
    subscriberID: input.subscriberId,
    purchaseID: input.purchaseId,
    payId: input.payId,
    pgResponseCode: input.pgResponseCode,
    data: input.paymentData
  };

  order.payment = {
    purchaseID: input.purchaseId,
    payId: input.payId,
    pgResponseCode: input.pgResponseCode,
    verificationState:
      input.pgResponseCode === "0"
        ? "pending"
        : "failed"
  };

  if (input.pgResponseCode === "0") {
    order.state = "pending";
    order.description =
      "Payment confirmation received; gateway verification pending";
  } else {
    order.state = "failed";
    order.description =
      `Payment gateway returned response code ${input.pgResponseCode}`;
  }

  if (typeof order.markModified === "function") {
    order.markModified("legacyPayload");
    order.markModified("payment");
  }

  await order.save();
  return order;
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
    "@type": "ProductOrder"
  };
}

function buildLegacyResponse(savedOrder) {
  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {
      status: "PENDING_VERIFICATION",
      message:
        "Payment confirmation received; gateway verification pending",
      path: "/confirmPrePaidProvisioning",
      productOrderId: String(savedOrder._id)
    },
    errorShow: null,
    errorCode: null
  };
}

async function confirmAddVasBundle(
  data,
  responseFormat = "tmf"
) {
  const input = validateInput(data);
  const existingOrder = await findProductOrder(input);

  if (!existingOrder) {
    const error = new Error(
      "No matching prepaid VAS data bundle order was found"
    );
    error.statusCode = 404;
    throw error;
  }

  const savedOrder = await applyPaymentConfirmation(
    existingOrder,
    input
  );

  if (input.pgResponseCode !== "0") {
    const error = new Error(savedOrder.description);
    error.statusCode = 400;
    throw error;
  }

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
  confirmAddVasBundle,
  normalizeInput,
  validateInput,
  findProductOrder,
  applyPaymentConfirmation,
  buildTmfResponse,
  buildLegacyResponse
};
