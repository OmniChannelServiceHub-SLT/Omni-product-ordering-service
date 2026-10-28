const ShoppingCart = require("../../../models/TMF663_ShoppingCart");

const {
  FIELD_DEFINITIONS,
  buildTmfResponse,
  normalizeInput,
  readField
} = require(
  "../../createApplicationLte/services/createApplicationLteService"
);

const PRIVILEGED_ROLES = new Set([
  "ADMIN",
  "CSR",
  "SUPPORT",
  "SYSTEM",
  "SERVICE"
]);

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeReference(value) {
  const reference = String(value ?? "").trim();

  if (!reference) {
    throw httpError(400, "REF_NO is required");
  }

  if (!/^LTE_[A-Za-z0-9_-]+$/.test(reference)) {
    throw httpError(400, "REF_NO must be a valid LTE reference");
  }

  return reference;
}

function normalizePatch(data = {}) {
  const hasServiceType =
    readField(data, "SERVICE_TYPE", "serviceType") !== undefined;
  const patch = normalizeInput(data);

  if (!hasServiceType) {
    delete patch.normalized.serviceType;
    delete patch.legacyPayload.SERVICE_TYPE;
  }

  return patch;
}

function toStringList(value) {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  return String(value ?? "")
    .split(/[\s,]+/)
    .filter(Boolean);
}

function isAuthorized(cart, principal = {}) {
  const roles = toStringList(principal.roles).map((role) =>
    role.toUpperCase()
  );

  if (roles.some((role) => PRIVILEGED_ROLES.has(role))) {
    return true;
  }

  const principalIds = [
    principal.sub,
    principal.userName,
    principal.username
  ]
    .filter((value) => value !== undefined && value !== null)
    .map((value) => String(value).trim());

  return (cart.relatedParty || []).some(
    (party) =>
      party.role === "requestor" &&
      principalIds.includes(String(party.id).trim())
  );
}

function mergeProductCharacteristics(cart, normalizedPatch) {
  const product = cart.cartItem?.[0]?.product;

  if (!product) {
    throw httpError(500, "LTE draft cartItem is missing");
  }

  const characteristics = new Map(
    (product.productCharacteristic || []).map((characteristic) => [
      characteristic.name,
      characteristic
    ])
  );

  Object.entries(normalizedPatch).forEach(([name, value]) => {
    if (value === "") {
      characteristics.delete(name);
      return;
    }

    characteristics.set(name, {
      name,
      value,
      "@type": "StringCharacteristic"
    });
  });

  product.productCharacteristic = Array.from(characteristics.values());
}

function buildLegacyResponse() {
  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {},
    errorShow: null,
    errorCode: null
  };
}

async function patchApplicationLte({
  reference,
  data,
  principal,
  responseFormat = "tmf"
} = {}) {
  const refNo = normalizeReference(reference);
  const patch = normalizePatch(data);
  const cart = await ShoppingCart.findOne({
    legacyOperation: "SaveDraftDataLTE",
    "legacyPayload.REF_NO": refNo
  });

  if (!cart) {
    throw httpError(404, `LTE application ${refNo} was not found`);
  }

  if (!isAuthorized(cart, principal)) {
    throw httpError(
      403,
      "The authenticated principal cannot update this LTE application"
    );
  }

  cart.legacyPayload = {
    ...(cart.legacyPayload || {}),
    ...patch.legacyPayload,
    REF_NO: refNo
  };
  mergeProductCharacteristics(cart, patch.normalized);

  if (typeof cart.markModified === "function") {
    cart.markModified("legacyPayload");
    cart.markModified("cartItem");
  }

  const savedCart = await cart.save();

  return {
    statusCode: 200,
    body:
      responseFormat === "legacy"
        ? buildLegacyResponse()
        : buildTmfResponse(savedCart, refNo)
  };
}

module.exports = {
  patchApplicationLte,
  normalizeReference,
  normalizePatch,
  isAuthorized,
  mergeProductCharacteristics,
  buildLegacyResponse,
  FIELD_DEFINITIONS
};
