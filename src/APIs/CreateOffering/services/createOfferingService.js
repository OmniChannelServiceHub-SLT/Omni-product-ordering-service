const ProductOfferingQualification = require(
  "../../../models/TMF679_ProductOfferingQualification"
);

const {
  isEntitledPrincipal
} = require("../../ListAccountLink/services/listAccountLinkService");

const TMF_BASE_PATH =
  "/tmf-api/productOfferingQualification/v4/productOfferingQualification";

const DEFAULT_OFFERINGS = Object.freeze({
  "0112488102": [
    {
      telephoneno: "0112488102",
      eligibledate: "6/15/2023 3:27:10 PM",
      expiredate: "7/15/2023 3:27:10 PM",
      packageid: "1",
      refno: ""
    },
    {
      telephoneno: "0112488102",
      eligibledate: "6/21/2023 3:45:46 PM",
      expiredate: "7/21/2023 3:45:46 PM",
      packageid: "1",
      refno: "28848"
    }
  ]
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
      data.telephone
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

  return {
    telephoneNo,
    channel
  };
}

function loadOfferingRegistry() {
  const configured = process.env.OFFERING_AVAILABILITY_JSON;

  if (!configured) {
    return DEFAULT_OFFERINGS;
  }

  let parsed;

  try {
    parsed = JSON.parse(configured);
  } catch (error) {
    throw httpError(500, "OFFERING_AVAILABILITY_JSON is not valid JSON");
  }

  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw httpError(
      500,
      "OFFERING_AVAILABILITY_JSON must be keyed by telephone number"
    );
  }

  return parsed;
}

function normalizeOffering(record, telephoneNo) {
  if (!record || Array.isArray(record) || typeof record !== "object") {
    throw httpError(500, "Configured offering entries must be objects");
  }

  const normalized = {
    telephoneno: String(record.telephoneno ?? telephoneNo),
    eligibledate: String(record.eligibledate ?? ""),
    expiredate: String(record.expiredate ?? ""),
    packageid: String(record.packageid ?? ""),
    refno: String(record.refno ?? "")
  };

  if (!normalized.packageid) {
    throw httpError(500, "Configured offering packageid is required");
  }

  ["eligibledate", "expiredate"].forEach((fieldName) => {
    if (
      normalized[fieldName] &&
      Number.isNaN(new Date(normalized[fieldName]).getTime())
    ) {
      throw httpError(
        500,
        `Configured offering ${fieldName} must be a valid date`
      );
    }
  });

  if (record.purchasecount !== undefined) {
    normalized.purchasecount = record.purchasecount;
  }

  return normalized;
}

function getOfferings(telephoneNo) {
  const records = loadOfferingRegistry()[telephoneNo] ?? [];

  if (!Array.isArray(records)) {
    throw httpError(
      500,
      `Configured offerings for ${telephoneNo} must be an array`
    );
  }

  return records.map((record) => normalizeOffering(record, telephoneNo));
}

function buildQualificationItem(offering, index) {
  const characteristics = [];

  if (offering.refno) {
    characteristics.push({
      name: "legacyReference",
      value: offering.refno,
      "@type": "StringCharacteristic"
    });
  }

  if (offering.purchasecount !== undefined) {
    characteristics.push({
      name: "purchaseCount",
      value: offering.purchasecount,
      "@type": "NumberCharacteristic"
    });
  }

  return {
    id: String(index + 1),
    qualificationResult: "qualified",
    validFor: {
      startDateTime: offering.eligibledate
        ? new Date(offering.eligibledate).toISOString()
        : undefined,
      endDateTime: offering.expiredate
        ? new Date(offering.expiredate).toISOString()
        : undefined
    },
    productOffering: {
      id: offering.packageid,
      "@type": "ProductOfferingRef"
    },
    product: {
      productCharacteristic: characteristics,
      "@type": "ProductRefOrValue"
    },
    "@type": "ProductOfferingQualificationItem"
  };
}

function buildQualification(input, offerings) {
  return {
    description: "TimelyPay product offering qualification",
    instantSyncQualification: true,
    state: "done",
    relatedParty: [
      {
        id: input.telephoneNo,
        role: "subscriber",
        "@type": "RelatedParty"
      }
    ],
    channel: [
      {
        id: input.channel,
        name: input.channel,
        "@type": "Channel"
      }
    ],
    productOfferingQualificationItem: offerings.map(
      buildQualificationItem
    ),
    legacyOperation: "checkofferavaliability",
    legacyPayload: {
      telephoneno: input.telephoneNo,
      offerings
    },
    "@type": "ProductOfferingQualification"
  };
}

function buildTmfResponse(savedQualification) {
  const id = String(savedQualification._id || savedQualification.id);

  if (!id || id === "undefined") {
    throw httpError(500, "Saved qualification id is missing");
  }

  return {
    id,
    href: `${TMF_BASE_PATH}/${encodeURIComponent(id)}`,
    description: savedQualification.description,
    instantSyncQualification:
      savedQualification.instantSyncQualification,
    state: savedQualification.state || "done",
    relatedParty: savedQualification.relatedParty || [],
    channel: savedQualification.channel || [],
    productOfferingQualificationItem:
      savedQualification.productOfferingQualificationItem || [],
    "@type": "ProductOfferingQualification"
  };
}

function buildLegacyResponse(offerings) {
  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: offerings,
    errorShow: null,
    errorCode: null
  };
}

async function createOffering({
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

  const offerings = getOfferings(input.telephoneNo);

  if (responseFormat === "legacy") {
    return {
      statusCode: 200,
      body: buildLegacyResponse(offerings)
    };
  }

  const qualification = buildQualification(input, offerings);
  const savedQualification = await ProductOfferingQualification.create(
    qualification
  );

  return {
    statusCode: 201,
    body: buildTmfResponse(savedQualification)
  };
}

module.exports = {
  createOffering,
  normalizeInput,
  getOfferings,
  buildQualification,
  buildTmfResponse,
  buildLegacyResponse
};
