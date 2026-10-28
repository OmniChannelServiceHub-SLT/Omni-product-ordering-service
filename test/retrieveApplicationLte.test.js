const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

const jwt = require("jsonwebtoken");
const ShoppingCart = require("../src/models/TMF663_ShoppingCart");

const TEST_SECRET = "retrieve-application-lte-test-secret";
const BASE_PATH =
  "/tmf-api/shoppingCart/v4/shoppingCart/application-lte";

let baseUrl;
let drafts;
let originalFindOne;
let server;

function tokenFor(sub = "applicant-user-id", roles = ["CUSTOMER"]) {
  return jwt.sign(
    {
      sub,
      userName: "0718175289",
      roles,
      scope: "iam:self"
    },
    TEST_SECRET,
    { expiresIn: "5m" }
  );
}

function createDraft() {
  const refNo = "LTE_3091";

  return {
    id: refNo,
    href: `/tmf-api/shoppingCart/v4/shoppingCart/${refNo}`,
    status: "active",
    createdAt: "2022-06-24T11:23:34.000Z",
    relatedParty: [
      {
        id: "applicant-user-id",
        role: "requestor",
        "@type": "RelatedParty"
      }
    ],
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
          productCharacteristic: [
            {
              name: "firstName",
              value: "Randika",
              "@type": "StringCharacteristic"
            }
          ],
          "@type": "ProductRefOrValue"
        },
        "@type": "CartItem"
      }
    ],
    legacyOperation: "SaveDraftDataLTE",
    legacyPayload: {
      REF_NO: refNo,
      NIC: "830381204V",
      PP: "",
      TITLE: "Mr",
      FIRSTNAME: "Randika",
      LASTNAME: "Kumara",
      BIRTH_DATE: "1989-09-26",
      NATIONALITY: "Srilankan",
      SERVICE_ADD_NO: "66",
      SERVICE_ADD_STREET1: "aaaa",
      SERVICE_ADD_STREET2: "bbbb",
      SERVICE_ADD_CITY: "cccc",
      SERVICE_ADD_DISTRICT: "dddd",
      BILLING_ADD_NO: "66",
      BILLING_ADD_STREET1: "aaaa",
      BILLING_ADD_STREET2: "bbbb",
      BILLING_ADD_CITY: "cccc",
      SERVICE_ADD_POSTAL_CODE: "1234",
      RTOM: "GQ",
      LONGITUDE: "1.00",
      LATITUDE: "12.36",
      SERVICE_TYPE: "LTE",
      SERVICE_ADD_PROVINCE: "HQ",
      BILLING_ADD_PROVINCE: "HQ",
      VOICE_PACKAGE: "Gold",
      BB_PACKAGE: "web",
      PEO_PACKAGE: "unantham",
      BILLING_ADD_POSTAL_CODE: "10256",
      GENDER: "Male",
      MOBILENO: "0718175289",
      EMAIL: "radika@slt.com.lk",
      BILLING_MODE: "Ebil",
      IDDSTATUS: "Y",
      USER_COMMENT: "dfdfg",
      SLTNIC: "830380124V",
      LOOP_AVAILABLITY: "Y"
    }
  };
}

async function getApplication({
  refNo,
  pathReference,
  responseFormat,
  token = tokenFor()
} = {}) {
  const path = pathReference
    ? `${BASE_PATH}/${encodeURIComponent(pathReference)}`
    : BASE_PATH;
  const url = new URL(path, baseUrl);

  if (refNo !== undefined) {
    url.searchParams.set("REF_NO", refNo);
  }

  const headers = {};

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  if (responseFormat) {
    headers["x-response-format"] = responseFormat;
  }

  const response = await fetch(url, { headers });

  return {
    response,
    body: await response.json()
  };
}

before(async () => {
  process.env.JWT_ACCESS_SECRET = TEST_SECRET;
  drafts = new Map([["LTE_3091", createDraft()]]);
  originalFindOne = ShoppingCart.findOne;
  ShoppingCart.findOne = async (query) =>
    drafts.get(query["legacyPayload.REF_NO"]) || null;

  const app = require("../src/app");

  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  ShoppingCart.findOne = originalFindOne;

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("retrieves the authorized TMF663 LTE draft", async () => {
  const { response, body } = await getApplication({
    pathReference: "LTE_3091"
  });

  assert.equal(response.status, 200);
  assert.equal(body.id, "LTE_3091");
  assert.equal(body.status, "active");
  assert.equal(body["@type"], "ShoppingCart");
  assert.equal(body.cartItem[0].product.productOffering.id, "LTE_CONNECTION");
});

test("returns the documented legacy LTE fields", async () => {
  const { response, body } = await getApplication({
    refNo: "LTE_3091",
    responseFormat: "legacy"
  });
  const application = body.dataBundle[0];

  assert.equal(response.status, 200);
  assert.equal(body.isSuccess, true);
  assert.equal(application.reF_NO, "LTE_3091");
  assert.equal(application.requesT_DATE, "6/24/2022 11:23:34 AM");
  assert.equal(application.birtH_DATE, "26/09/1989");
  assert.equal(application.firstname, "Randika");
  assert.equal(application.filE_UPLOAD_STATUS, "");
  assert.equal(application.paymenT_REFUND_STATUS, "");
  assert.equal(application.coveragE_AVAILABLITY, "Y");
});

test("returns 404 for an unknown LTE draft", async () => {
  const { response, body } = await getApplication({
    refNo: "LTE_9999"
  });

  assert.equal(response.status, 404);
  assert.match(body.message, /LTE_9999/);
});

test("rejects a principal that does not own the LTE draft", async () => {
  const { response, body } = await getApplication({
    refNo: "LTE_3091",
    token: tokenFor("different-user")
  });

  assert.equal(response.status, 403);
  assert.equal(body.reason, "Forbidden");
});

test("requires REF_NO", async () => {
  const { response, body } = await getApplication();

  assert.equal(response.status, 400);
  assert.match(body.message, /REF_NO/);
});
