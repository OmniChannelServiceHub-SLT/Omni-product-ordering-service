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
    )
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

  if (missingFields.length > 0) {
    const error = new Error(
      `Missing required query parameter(s): ${missingFields.join(", ")}`
    );
    error.statusCode = 400;
    throw error;
  }

  const normalized = {
    subscriberId: String(input.subscriberId).trim(),
    receiverId: String(input.receiverId).trim()
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

  return normalized;
}

function buildValidationResponse(input) {
  return {
    description: "Validate data transfer subscribers",
    validationStatus: "pendingProviderValidation",
    eligible: null,
    reason:
      "Provider eligibility validation is not configured",
    relatedParty: [
      {
        id: input.subscriberId,
        role: "sender",
        "@type": "RelatedParty",
        "@referredType": "Individual"
      },
      {
        id: input.receiverId,
        role: "receiver",
        "@type": "RelatedParty",
        "@referredType": "Individual"
      }
    ],
    "@type": "DataTransferSubscriberValidation"
  };
}

function buildLegacyResponse(input) {
  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {
      opStatus: "PENDING",
      opStatusDescription:
        "Provider eligibility validation is not configured",
      subscriberID: input.subscriberId,
      reciever: input.receiverId
    },
    errorShow: null,
    errorCode: null
  };
}

async function validateDataTransfer(
  data,
  responseFormat = "tmf"
) {
  const input = validateInput(data);

  if (responseFormat === "legacy") {
    return {
      statusCode: 200,
      body: buildLegacyResponse(input)
    };
  }

  return {
    statusCode: 200,
    body: buildValidationResponse(input)
  };
}

module.exports = {
  validateDataTransfer,
  normalizeInput,
  validateInput,
  buildValidationResponse,
  buildLegacyResponse
};
