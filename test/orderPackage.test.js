const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

const jwt = require("jsonwebtoken");
const ProductOrder = require("../src/models/TMF622_ProductOrder");

const TEST_SECRET = "order-package-test-secret";
const TMF_PATH =
  "/tmf-api/productOrderingManagement/v4/productOrder/order-package";
const LEGACY_PATH =
  "/tmf-api/productOrderingManagement/v1/productOrder/order-package";

let baseUrl;
let originalCreate;
let savedOrders;
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

async function requestOrder({
  path = TMF_PATH,
  token,
  body,
  query,
  legacy = false
} = {}) {
  const url = new URL(path, baseUrl);

  Object.entries(query || {}).forEach(([name, value]) => {
    url.searchParams.set(name, value);
  });

  const headers = {
    "content-type": "application/json"
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  if (legacy) {
    headers["x-response-format"] = "legacy";
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body || {})
  });

  return {
    response,
    body: await response.json()
  };
}

before(async () => {
  process.env.JWT_ACCESS_SECRET = TEST_SECRET;
  savedOrders = [];
  originalCreate = ProductOrder.create;
  ProductOrder.create = async (order) => {
    const saved = {
      ...order,
      _id: `order-${savedOrders.length + 1}`,
      createdAt: new Date().toISOString()
    };
    savedOrders.push(saved);
    return saved;
  };

  const app = require("../src/app");

  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  ProductOrder.create = originalCreate;

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("creates a persisted TMF622 package order", async () => {
  const { response, body } = await requestOrder({
    token: tokenFor("94332295601"),
    body: {
      telephoneno: "94332295601",
      packageid: "1"
    }
  });

  assert.equal(response.status, 201);
  assert.equal(body["@type"], "ProductOrder");
  assert.equal(body.state, "acknowledged");
  assert.equal(body.relatedParty[0].id, "94332295601");
  assert.equal(body.productOrderItem[0].action, "add");
  assert.equal(body.productOrderItem[0].productOffering.id, "1");
  assert.equal(response.headers.get("location"), body.href);
  assert.equal(savedOrders.length, 1);
});

test("accepts the workbook query-string inputs and returns legacy status", async () => {
  const { response, body } = await requestOrder({
    path: LEGACY_PATH,
    token: tokenFor("94332295601"),
    query: {
      telephoneno: "94332295601",
      packageid: "1"
    },
    legacy: true
  });

  assert.equal(response.status, 200);
  assert.equal(body.isSuccess, true);
  assert.equal(body.dataBundle.result, "Pending");
  assert.match(body.dataBundle.resultDesc, /downstream fulfillment/);
  assert.ok(body.dataBundle.productOrderId);
});

test("maps receiver and channel identifiers into the product order", async () => {
  const { response, body } = await requestOrder({
    token: tokenFor("94332295601"),
    body: {
      telephoneno: "94332295601",
      packageid: "1",
      receiver: "94771234567",
      channel: "MYSLT"
    }
  });

  assert.equal(response.status, 201);
  assert.equal(body.relatedParty[1].role, "receiver");
  assert.equal(body.relatedParty[1].id, "94771234567");
  assert.deepEqual(
    body.productOrderItem[0].product.productCharacteristic.map(
      ({ name, value }) => [name, value]
    ),
    [
      ["channel", "MYSLT"],
      ["receiverTelephoneNo", "94771234567"]
    ]
  );
});

test("rejects an unknown package", async () => {
  const { response, body } = await requestOrder({
    token: tokenFor("94332295601"),
    body: {
      telephoneno: "94332295601",
      packageid: "999"
    }
  });

  assert.equal(response.status, 404);
  assert.match(body.message, /Package 999/);
});

test("rejects an order for another subscriber", async () => {
  const { response, body } = await requestOrder({
    token: tokenFor("94771234567"),
    body: {
      telephoneno: "94332295601",
      packageid: "1"
    }
  });

  assert.equal(response.status, 403);
  assert.equal(body.reason, "Forbidden");
});

test("requires a package id", async () => {
  const { response, body } = await requestOrder({
    token: tokenFor("94332295601"),
    body: {
      telephoneno: "94332295601"
    }
  });

  assert.equal(response.status, 400);
  assert.match(body.message, /packageid/);
});

test("requires authentication", async () => {
  const { response, body } = await requestOrder({
    body: {
      telephoneno: "94332295601",
      packageid: "1"
    }
  });

  assert.equal(response.status, 401);
  assert.equal(body.reason, "Unauthorized");
});
