const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

const jwt = require("jsonwebtoken");
const ShoppingCart = require("../src/models/TMF663_ShoppingCart");

const TEST_SECRET = "create-application-lte-test-secret";
const BASE_PATH =
  "/tmf-api/shoppingCart/v4/shoppingCart/application-lte";

const SAMPLE_APPLICATION = {
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
};

let baseUrl;
let originalCreate;
let savedCarts;
let server;

function createToken() {
  return jwt.sign(
    {
      sub: "applicant-user-id",
      userName: "0718175289",
      roles: ["CUSTOMER"],
      scope: "iam:self"
    },
    TEST_SECRET,
    { expiresIn: "5m" }
  );
}

async function postApplication(body, options = {}) {
  const headers = {
    "content-type": "application/json"
  };

  if (options.auth !== false) {
    headers.authorization = `Bearer ${createToken()}`;
  }

  if (options.responseFormat) {
    headers["x-response-format"] = options.responseFormat;
  }

  const response = await fetch(new URL(BASE_PATH, baseUrl), {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  return {
    response,
    body: await response.json()
  };
}

before(async () => {
  process.env.JWT_ACCESS_SECRET = TEST_SECRET;
  savedCarts = [];
  originalCreate = ShoppingCart.create;
  ShoppingCart.create = async (cart) => {
    const saved = {
      ...cart,
      _id: `mongo-${savedCarts.length + 1}`,
      createdAt: new Date().toISOString()
    };
    savedCarts.push(saved);
    return saved;
  };

  const app = require("../src/app");

  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  ShoppingCart.create = originalCreate;

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("creates a TMF663 LTE draft shopping cart", async () => {
  const { response, body } = await postApplication(SAMPLE_APPLICATION);

  assert.equal(response.status, 201);
  assert.match(body.id, /^LTE_\d+$/);
  assert.equal(body["@type"], "ShoppingCart");
  assert.equal(body.status, "active");
  assert.equal(body.cartItem[0].product.productOffering.id, "LTE_CONNECTION");
  assert.equal(response.headers.get("location"), body.href);
  assert.equal(savedCarts.at(-1).legacyPayload.NIC, "830381204V");
  assert.equal(savedCarts.at(-1).legacyPayload.PP, "");
});

test("returns the documented legacy response", async () => {
  const { response, body } = await postApplication(SAMPLE_APPLICATION, {
    responseFormat: "legacy"
  });

  assert.equal(response.status, 200);
  assert.equal(body.isSuccess, true);
  assert.match(body.dataBundle.orderRefLTE, /^LTE_\d+$/);
  assert.equal(body.errorCode, null);
});

test("accepts a partial LTE draft", async () => {
  const { response, body } = await postApplication({
    NIC: "830381204V",
    FIRSTNAME: "Randika"
  });

  assert.equal(response.status, 201);
  assert.equal(body.status, "active");
  assert.equal(savedCarts.at(-1).legacyPayload.SERVICE_TYPE, "LTE");
});

test("rejects an invalid LTE application field", async () => {
  const { response, body } = await postApplication({
    SERVICE_TYPE: "LTE",
    EMAIL: "not-an-email"
  });

  assert.equal(response.status, 400);
  assert.match(body.message, /EMAIL/);
});

test("requires authentication", async () => {
  const { response, body } = await postApplication(SAMPLE_APPLICATION, {
    auth: false
  });

  assert.equal(response.status, 401);
  assert.equal(body.reason, "Unauthorized");
});
