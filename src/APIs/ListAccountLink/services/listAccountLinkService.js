const DEFAULT_ACCOUNT_LINKS = Object.freeze({
  "0382222802": [
    "dinesh_wimalakeerthi@yahoo.com",
    "eathameera@gmail.com",
    "0715364923",
    "0719080968"
  ]
});

const PRIVILEGED_ROLES = new Set([
  "ADMIN",
  "CSR",
  "SUPPORT",
  "SYSTEM",
  "SERVICE"
]);

const READ_ANY_SCOPES = new Set([
  "account-link:read:any",
  "product-ordering:read:any"
]);

const TMF_BASE_PATH =
  "/tmf-api/productOfferingQualification/v4/productOfferingQualification";

function buildLegacyResponse(accountLinks = []) {
  const dataBundle = {
    registered: accountLinks.length > 0 ? "Y" : "N"
  };

  accountLinks.forEach((username, index) => {
    dataBundle[`username${index}`] = username;
  });

  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle,
    errorShow: null,
    errorCode: null
  };
}

function buildTmfResponse(telephoneNo, accountLinks = []) {
  const encodedTelephoneNo = encodeURIComponent(telephoneNo);

  return {
    id: `account-link-${telephoneNo.replace(/[^0-9]/g, "")}`,
    href:
      `${TMF_BASE_PATH}/account-link?telephoneNo=${encodedTelephoneNo}`,
    description: "Authorized account-link qualification",
    instantSyncQualification: true,
    state: "done",
    relatedParty: [
      {
        id: telephoneNo,
        role: "subscriber",
        "@type": "RelatedParty"
      }
    ],
    productOfferingQualificationItem: accountLinks.map(
      (username, index) => ({
        id: String(index + 1),
        qualificationResult: "qualified",
        product: {
          productCharacteristic: [
            {
              name: "linkedAccountUsername",
              value: username,
              "@type": "StringCharacteristic"
            }
          ],
          "@type": "ProductRefOrValue"
        },
        "@type": "ProductOfferingQualificationItem"
      })
    ),
    "@type": "ProductOfferingQualification"
  };
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeTelephoneNo(value) {
  const telephoneNo = String(value ?? "").trim();

  if (!telephoneNo) {
    throw httpError(
      400,
      "Missing required query parameter: telephoneNo"
    );
  }

  if (!/^\+?[0-9]{7,15}$/.test(telephoneNo)) {
    throw httpError(
      400,
      "telephoneNo must contain 7 to 15 digits with an optional leading +"
    );
  }

  return telephoneNo;
}

function toStringList(value) {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  return String(value ?? "")
    .split(/[\s,]+/)
    .filter(Boolean);
}

function isEntitledPrincipal(principal = {}, telephoneNo) {
  const roles = toStringList(principal.roles).map((role) =>
    role.toUpperCase()
  );
  const scopes = toStringList(principal.scope);

  if (
    roles.some((role) => PRIVILEGED_ROLES.has(role)) ||
    scopes.some((scope) => READ_ANY_SCOPES.has(scope))
  ) {
    return true;
  }

  const selfIdentifiers = [
    principal.userName,
    principal.username,
    principal.telephoneNo,
    principal.subscriberID,
    principal.accountNo
  ]
    .filter((value) => value !== undefined && value !== null)
    .map((value) => String(value).trim());

  return selfIdentifiers.includes(telephoneNo);
}

function loadAccountLinks() {
  const configured = process.env.ACCOUNT_LINKS_JSON;

  if (!configured) {
    return DEFAULT_ACCOUNT_LINKS;
  }

  let parsed;

  try {
    parsed = JSON.parse(configured);
  } catch (error) {
    throw httpError(500, "ACCOUNT_LINKS_JSON is not valid JSON");
  }

  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw httpError(
      500,
      "ACCOUNT_LINKS_JSON must be an object keyed by telephone number"
    );
  }

  return parsed;
}

function getAccountLinks(telephoneNo) {
  const accountLinks = loadAccountLinks()[telephoneNo] ?? [];

  if (!Array.isArray(accountLinks)) {
    throw httpError(
      500,
      `Configured account links for ${telephoneNo} must be an array`
    );
  }

  return accountLinks
    .map((value) => String(value).trim())
    .filter(Boolean);
}

async function listAccountLink({
  telephoneNo: rawTelephoneNo,
  principal,
  responseFormat = "tmf"
} = {}) {
  const telephoneNo = normalizeTelephoneNo(rawTelephoneNo);

  if (!isEntitledPrincipal(principal, telephoneNo)) {
    throw httpError(
      403,
      "The authenticated principal is not entitled to this telephone number"
    );
  }

  const accountLinks = getAccountLinks(telephoneNo);

  return {
    statusCode: 200,
    body:
      responseFormat === "legacy"
        ? buildLegacyResponse(accountLinks)
        : buildTmfResponse(telephoneNo, accountLinks)
  };
}

module.exports = {
  listAccountLink,
  normalizeTelephoneNo,
  isEntitledPrincipal,
  getAccountLinks,
  buildLegacyResponse,
  buildTmfResponse
};
