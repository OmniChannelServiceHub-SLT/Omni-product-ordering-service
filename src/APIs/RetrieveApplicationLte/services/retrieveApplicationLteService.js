const ShoppingCart = require("../../../models/TMF663_ShoppingCart");

const {
  buildTmfResponse
} = require(
  "../../createApplicationLte/services/createApplicationLteService"
);
const {
  isAuthorized,
  normalizeReference
} = require(
  "../../patchApplicationLte/services/patchApplicationLteService"
);

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function value(payload, key, fallback = "") {
  const fieldValue = payload?.[key];
  return fieldValue === undefined || fieldValue === null
    ? fallback
    : fieldValue;
}

function formatBirthDate(dateValue) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
    String(dateValue || "")
  );

  return match ? `${match[3]}/${match[2]}/${match[1]}` : dateValue || "";
}

function formatRequestDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const hour = date.getUTCHours();
  const hour12 = hour % 12 || 12;
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  const period = hour >= 12 ? "PM" : "AM";

  return (
    `${date.getUTCMonth() + 1}/${date.getUTCDate()}/` +
    `${date.getUTCFullYear()} ${hour12}:${minutes}:${seconds} ${period}`
  );
}

function buildLegacyApplication(cart) {
  const payload = cart.legacyPayload || {};

  return {
    reF_NO: value(payload, "REF_NO", cart.id || ""),
    requesT_DATE: formatRequestDate(cart.createdAt),
    nic: value(payload, "NIC"),
    pp: value(payload, "PP"),
    title: value(payload, "TITLE"),
    firstname: value(payload, "FIRSTNAME"),
    lastname: value(payload, "LASTNAME"),
    birtH_DATE: formatBirthDate(value(payload, "BIRTH_DATE")),
    nationality: value(payload, "NATIONALITY"),
    servicE_ADD_NO: value(payload, "SERVICE_ADD_NO"),
    servicE_ADD_STREET1: value(payload, "SERVICE_ADD_STREET1"),
    servicE_ADD_STREET2: value(payload, "SERVICE_ADD_STREET2"),
    servicE_ADD_CITY: value(payload, "SERVICE_ADD_CITY"),
    servicE_ADD_DISTRICT: value(payload, "SERVICE_ADD_DISTRICT"),
    billinG_ADD_NO: value(payload, "BILLING_ADD_NO"),
    billinG_ADD_STREET1: value(payload, "BILLING_ADD_STREET1"),
    billinG_ADD_STREET2: value(payload, "BILLING_ADD_STREET2"),
    billinG_ADD_CITY: value(payload, "BILLING_ADD_CITY"),
    servicE_ADD_POSTAL_CODE: value(payload, "SERVICE_ADD_POSTAL_CODE"),
    rtom: value(payload, "RTOM"),
    longitude: value(payload, "LONGITUDE"),
    latitude: value(payload, "LATITUDE"),
    servicE_TYPE: value(payload, "SERVICE_TYPE", "LTE"),
    servicE_ADD_PROVINCE: value(payload, "SERVICE_ADD_PROVINCE"),
    billinG_ADD_PROVINCE: value(payload, "BILLING_ADD_PROVINCE"),
    voicE_PACKAGE: value(payload, "VOICE_PACKAGE"),
    bB_PACKAGE: value(payload, "BB_PACKAGE"),
    peO_PACKAGE: value(payload, "PEO_PACKAGE"),
    billinG_ADD_POSTAL_CODE: value(
      payload,
      "BILLING_ADD_POSTAL_CODE"
    ),
    filE_UPLOAD_STATUS: value(payload, "FILE_UPLOAD_STATUS"),
    filE_UPLOAD_FACILITY_CALLED: value(
      payload,
      "FILE_UPLOAD_FACILITY_CALLED"
    ),
    gender: value(payload, "GENDER"),
    mobileno: value(payload, "MOBILENO"),
    email: value(payload, "EMAIL"),
    billinG_MODE: value(payload, "BILLING_MODE"),
    iddstatus: value(payload, "IDDSTATUS"),
    useR_COMMENT: value(payload, "USER_COMMENT"),
    paymenT_REFUND_CALLED: value(payload, "PAYMENT_REFUND_CALLED"),
    paymenT_REFUND_STATUS: value(payload, "PAYMENT_REFUND_STATUS"),
    sltnic: value(payload, "SLTNIC"),
    coveragE_AVAILABLITY: value(
      payload,
      "COVERAGE_AVAILABLITY",
      value(payload, "LOOP_AVAILABLITY")
    )
  };
}

function buildLegacyResponse(cart) {
  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: [buildLegacyApplication(cart)],
    errorShow: null,
    errorCode: null
  };
}

async function retrieveApplicationLte({
  reference,
  principal,
  responseFormat = "tmf"
} = {}) {
  const refNo = normalizeReference(reference);
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
      "The authenticated principal cannot retrieve this LTE application"
    );
  }

  return {
    statusCode: 200,
    body:
      responseFormat === "legacy"
        ? buildLegacyResponse(cart)
        : buildTmfResponse(cart, refNo)
  };
}

module.exports = {
  retrieveApplicationLte,
  buildLegacyApplication,
  buildLegacyResponse,
  formatBirthDate,
  formatRequestDate
};
