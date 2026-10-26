const ShoppingCart = require("../../../models/TMF663_ShoppingCart");

const TMF_BASE_PATH = "/tmf-api/shoppingCart/v4/shoppingCart";

const FIELD_DEFINITIONS = [
  ["NIC", "nic"],
  ["PP", "passportNumber"],
  ["TITLE", "title"],
  ["FIRSTNAME", "firstName"],
  ["LASTNAME", "lastName"],
  ["BIRTH_DATE", "birthDate"],
  ["NATIONALITY", "nationality"],
  ["SERVICE_ADD_NO", "serviceAddressNumber"],
  ["SERVICE_ADD_STREET1", "serviceAddressStreet1"],
  ["SERVICE_ADD_STREET2", "serviceAddressStreet2"],
  ["SERVICE_ADD_CITY", "serviceAddressCity"],
  ["SERVICE_ADD_DISTRICT", "serviceAddressDistrict"],
  ["BILLING_ADD_NO", "billingAddressNumber"],
  ["BILLING_ADD_STREET1", "billingAddressStreet1"],
  ["BILLING_ADD_STREET2", "billingAddressStreet2"],
  ["BILLING_ADD_CITY", "billingAddressCity"],
  ["SERVICE_ADD_POSTAL_CODE", "serviceAddressPostalCode"],
  ["RTOM", "rtom"],
  ["LONGITUDE", "longitude"],
  ["LATITUDE", "latitude"],
  ["SERVICE_TYPE", "serviceType"],
  ["SERVICE_ADD_PROVINCE", "serviceAddressProvince"],
  ["BILLING_ADD_PROVINCE", "billingAddressProvince"],
  ["VOICE_PACKAGE", "voicePackage"],
  ["BB_PACKAGE", "broadbandPackage"],
  ["PEO_PACKAGE", "peoPackage"],
  ["BILLING_ADD_POSTAL_CODE", "billingAddressPostalCode"],
  ["GENDER", "gender"],
  ["MOBILENO", "mobileNumber"],
  ["EMAIL", "email"],
  ["BILLING_MODE", "billingMode"],
  ["IDDSTATUS", "iddStatus"],
  ["USER_COMMENT", "userComment"],
  ["SLTNIC", "sltNic"],
  ["LOOP_AVAILABLITY", "loopAvailability"]
];

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function readField(data, legacyName, canonicalName) {
  const matchingKey = Object.keys(data).find(
    (key) =>
      key.toLowerCase() === legacyName.toLowerCase() ||
      key.toLowerCase() === canonicalName.toLowerCase()
  );

  return matchingKey === undefined ? undefined : data[matchingKey];
}

function normalizeInput(data = {}) {
  if (!data || Array.isArray(data) || typeof data !== "object") {
    throw httpError(400, "A JSON object request body is required");
  }

  const legacyPayload = {};
  const normalized = {};

  FIELD_DEFINITIONS.forEach(([legacyName, canonicalName]) => {
    const value = readField(data, legacyName, canonicalName);

    if (value !== undefined && value !== null) {
      const normalizedValue =
        typeof value === "string" ? value.trim() : value;
      legacyPayload[legacyName] = normalizedValue;
      normalized[canonicalName] = normalizedValue;
    }
  });

  if (Object.keys(legacyPayload).length === 0) {
    throw httpError(
      400,
      "At least one LTE application field is required"
    );
  }

  if (!normalized.serviceType) {
    normalized.serviceType = "LTE";
    legacyPayload.SERVICE_TYPE = "LTE";
  }

  validateInput(normalized);

  return {
    normalized,
    legacyPayload
  };
}

function isValidDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return false;
  }

  const [year, month, day] = String(value).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateCoordinate(value, fieldName, min, max) {
  if (value === undefined || value === "") {
    return;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < min || number > max) {
    throw httpError(
      400,
      `${fieldName} must be a number between ${min} and ${max}`
    );
  }
}

function validateInput(input) {
  if (String(input.serviceType).toUpperCase() !== "LTE") {
    throw httpError(400, "SERVICE_TYPE must be LTE");
  }

  if (input.birthDate && !isValidDateOnly(input.birthDate)) {
    throw httpError(
      400,
      "BIRTH_DATE must be a valid date in YYYY-MM-DD format"
    );
  }

  if (
    input.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input.email))
  ) {
    throw httpError(400, "EMAIL must be a valid email address");
  }

  if (
    input.mobileNumber &&
    !/^\+?[0-9]{7,15}$/.test(String(input.mobileNumber))
  ) {
    throw httpError(
      400,
      "MOBILENO must contain 7 to 15 digits with an optional leading +"
    );
  }

  validateCoordinate(input.longitude, "LONGITUDE", -180, 180);
  validateCoordinate(input.latitude, "LATITUDE", -90, 90);

  [
    ["IDDSTATUS", input.iddStatus],
    ["LOOP_AVAILABLITY", input.loopAvailability]
  ].forEach(([fieldName, value]) => {
    if (
      value !== undefined &&
      value !== "" &&
      !["Y", "N"].includes(String(value).toUpperCase())
    ) {
      throw httpError(400, `${fieldName} must be Y or N`);
    }
  });
}

function buildProductCharacteristics(normalized) {
  return Object.entries(normalized)
    .filter(([, value]) => value !== "")
    .map(([name, value]) => ({
      name,
      value,
      "@type": "StringCharacteristic"
    }));
}

function buildShoppingCart(orderRefLte, input, principal = {}) {
  const principalId = String(
    principal.sub || principal.userName || principal.username || ""
  ).trim();
  const relatedParty = [];

  if (principalId) {
    relatedParty.push({
      id: principalId,
      role: "requestor",
      "@type": "RelatedParty"
    });
  }

  if (input.normalized.mobileNumber) {
    relatedParty.push({
      id: String(input.normalized.mobileNumber),
      role: "applicant",
      "@type": "RelatedParty"
    });
  }

  return {
    id: orderRefLte,
    href: `${TMF_BASE_PATH}/${encodeURIComponent(orderRefLte)}`,
    status: "active",
    relatedParty,
    cartItem: [
      {
        id: "1",
        action: "add",
        product: {
          productOffering: {
            id: "LTE_CONNECTION",
            name: "LTE Connection",
            "@type": "ProductOfferingRef"
          },
          productCharacteristic: buildProductCharacteristics(
            input.normalized
          ),
          "@type": "ProductRefOrValue"
        },
        "@type": "CartItem"
      }
    ],
    legacyOperation: "SaveDraftDataLTE",
    legacyPayload: {
      ...input.legacyPayload,
      REF_NO: orderRefLte
    },
    "@type": "ShoppingCart"
  };
}

function buildTmfResponse(savedCart, orderRefLte) {
  return {
    id: orderRefLte,
    href:
      savedCart.href ||
      `${TMF_BASE_PATH}/${encodeURIComponent(orderRefLte)}`,
    status: savedCart.status || "active",
    relatedParty: savedCart.relatedParty || [],
    cartItem: savedCart.cartItem || [],
    "@type": "ShoppingCart"
  };
}

function buildLegacyResponse(orderRefLte) {
  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {
      orderRefLTE: orderRefLte
    },
    errorShow: null,
    errorCode: null
  };
}

function createOrderReference() {
  return `LTE_${Date.now()}`;
}

async function createApplicationLte({
  data,
  principal,
  responseFormat = "tmf"
} = {}) {
  const input = normalizeInput(data);
  const orderRefLte = createOrderReference();
  const shoppingCart = buildShoppingCart(
    orderRefLte,
    input,
    principal
  );
  const savedCart = await ShoppingCart.create(shoppingCart);

  return {
    statusCode: responseFormat === "legacy" ? 200 : 201,
    body:
      responseFormat === "legacy"
        ? buildLegacyResponse(orderRefLte)
        : buildTmfResponse(savedCart, orderRefLte)
  };
}

module.exports = {
  createApplicationLte,
  normalizeInput,
  validateInput,
  buildShoppingCart,
  buildTmfResponse,
  buildLegacyResponse
};
