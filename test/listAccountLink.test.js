const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

const jwt = require("jsonwebtoken");

const TEST_SECRET = "list-account-link-test-secret";
const BASE_PATH =
  "/tmf-api/productOfferingQualification/v4/productOfferingQualification/account-link";

let baseUrl;
let server;

function tokenFor(userName, roles = ["CUSTOMER"]) {
  return jwt.sign(
    {
      sub: `user-${userName}`,
      userName,
      roles,
      scope: "iam:self"
    },
    TEST_SECRET,
    { expiresIn: "5m" }
  );
}

async function getAccountLinks({
  telephoneNo,
  token,
  responseFormat
} = {}) {
  const url = new URL(BASE_PATH, baseUrl);

  if (telephoneNo !== undefined) {
    url.searchParams.set("telephoneNo", telephoneNo);
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
  const app = require("../src/app");

  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("returns a TMF679 qualification for the entitled customer", async () => {
  const { response, body } = await getAccountLinks({
    telephoneNo: "0382222802",
    token: tokenFor("0382222802")
  });

  assert.equal(response.status, 200);
  assert.equal(body["@type"], "ProductOfferingQualification");
  assert.equal(body.state, "done");
  assert.equal(body.relatedParty[0].id, "0382222802");
  assert.equal(body.productOfferingQualificationItem.length, 4);
  assert.equal(
    body.productOfferingQualificationItem[0].product
      .productCharacteristic[0].value,
    "dinesh_wimalakeerthi@yahoo.com"
  );
});

test("returns the Excel legacy response when requested", async () => {
  const { response, body } = await getAccountLinks({
    telephoneNo: "0382222802",
    token: tokenFor("0382222802"),
    responseFormat: "legacy"
  });

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {
      registered: "Y",
      username0: "dinesh_wimalakeerthi@yahoo.com",
      username1: "eathameera@gmail.com",
      username2: "0715364923",
      username3: "0719080968"
    },
    errorShow: null,
    errorCode: null
  });
});

test("rejects access to another customer's account links", async () => {
  const { response, body } = await getAccountLinks({
    telephoneNo: "0382222802",
    token: tokenFor("0711111111")
  });

  assert.equal(response.status, 403);
  assert.equal(body.reason, "Forbidden");
});

test("allows an explicitly configured username-to-subscriber entitlement", async () => {
  process.env.SUBSCRIBER_ENTITLEMENTS_JSON = JSON.stringify({
    testuser: ["0382222802"]
  });

  try {
    const { response, body } = await getAccountLinks({
      telephoneNo: "0382222802",
      token: tokenFor("testuser")
    });

    assert.equal(response.status, 200);
    assert.equal(body["@type"], "ProductOfferingQualification");
  } finally {
    delete process.env.SUBSCRIBER_ENTITLEMENTS_JSON;
  }
});

test("requires telephoneNo", async () => {
  const { response, body } = await getAccountLinks({
    token: tokenFor("0382222802")
  });

  assert.equal(response.status, 400);
  assert.match(body.message, /telephoneNo/);
});

test("requires a bearer token", async () => {
  const { response, body } = await getAccountLinks({
    telephoneNo: "0382222802"
  });

  assert.equal(response.status, 401);
  assert.equal(body.reason, "Unauthorized");
});
