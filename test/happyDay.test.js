const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

const jwt = require("jsonwebtoken");
const ProductOrder = require("../src/models/TMF622_ProductOrder");

const TEST_SECRET = "happy-day-test-secret";
const TMF_PATH =
  "/tmf-api/productOrderingManagement/v4/productOrder/happy-day";
const LEGACY_PATH =
  "/tmf-api/productOrderingManagement/v1/productOrder/happy-day";

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

async function requestHappyDay({
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
      _id: `happy-day-${savedOrders.length + 1}`,
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

test("creates a persisted TMF622 Happy Day order", async () => {
  const { response, body } = await requestHappyDay({
    token: tokenFor("94332295601"),
    body: {
      subscriberID: "94332295601",
      happydate: "2026-10-31",
      channel: "SCP",
      commituser: "user"
    }
  });

  assert.equal(response.status, 201);
  assert.equal(body["@type"], "ProductOrder");
  assert.equal(body.state, "acknowledged");
  assert.equal(body.relatedParty[0].id, "94332295601");
  assert.equal(body.productOrderItem[0].action, "modify");
  assert.equal(
    body.productOrderItem[0].productOffering.id,
    "HAPPY_DAY"
  );
  assert.equal(response.headers.get("location"), body.href);
  assert.equal(savedOrders.length, 1);
});

test("accepts workbook query parameters and returns legacy status", async () => {
  const { response, body } = await requestHappyDay({
    path: LEGACY_PATH,
    token: tokenFor("94332295601"),
    query: {
      subscriberID: "94332295601",
      happydate: "2026-10-31",
      channel: "SCP",
      commituser: "user"
    },
    legacy: true
  });

  assert.equal(response.status, 200);
  assert.equal(body.isSuccess, true);
  assert.equal(body.dataBundle.status, "ACCEPTED");
  assert.match(body.dataBundle.message, /2026-10-31/);
  assert.match(body.dataBundle.message, /pending/);
  assert.equal(body.dataBundle.path, "");
  assert.ok(body.dataBundle.productOrderId);
});

test("maps the workbook fields into product characteristics", async () => {
  const { response, body } = await requestHappyDay({
    token: tokenFor("94332295601"),
    body: {
      subscriberId: "94332295601",
      happyDate: "2026-12-25",
      channel: "MYSLT",
      commitUser: "portal-user"
    }
  });

  assert.equal(response.status, 201);
  assert.deepEqual(
    body.productOrderItem[0].product.productCharacteristic.map(
      ({ name, value }) => [name, value]
    ),
    [
      ["happyDate", "2026-12-25"],
      ["channel", "MYSLT"],
      ["commitUser", "portal-user"]
    ]
  );
});

test("rejects an invalid calendar date", async () => {
  const { response, body } = await requestHappyDay({
    token: tokenFor("94332295601"),
    body: {
      subscriberID: "94332295601",
      happydate: "2026-02-30",
      channel: "SCP",
      commituser: "user"
    }
  });

  assert.equal(response.status, 400);
  assert.match(body.message, /valid calendar date/);
});

test("rejects a Happy Day order for another subscriber", async () => {
  const { response, body } = await requestHappyDay({
    token: tokenFor("94771234567"),
    body: {
      subscriberID: "94332295601",
      happydate: "2026-10-31",
      channel: "SCP",
      commituser: "user"
    }
  });

  assert.equal(response.status, 403);
  assert.equal(body.reason, "Forbidden");
});

test("requires all workbook parameters", async () => {
  const { response, body } = await requestHappyDay({
    token: tokenFor("94332295601"),
    body: {
      subscriberID: "94332295601"
    }
  });

  assert.equal(response.status, 400);
  assert.match(body.message, /happydate/);
  assert.match(body.message, /channel/);
  assert.match(body.message, /commituser/);
});

test("requires authentication", async () => {
  const { response, body } = await requestHappyDay({
    body: {
      subscriberID: "94332295601",
      happydate: "2026-10-31",
      channel: "SCP",
      commituser: "user"
    }
  });

  assert.equal(response.status, 401);
  assert.equal(body.reason, "Unauthorized");
});
