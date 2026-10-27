const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const jwt = require("jsonwebtoken");

const ProductOrder = require("../src/models/TMF622_ProductOrder");
const ShoppingCart = require("../src/models/TMF663_ShoppingCart");
const ProductOfferingQualification = require(
  "../src/models/TMF679_ProductOfferingQualification"
);

const TEST_SECRET = "tmf-standard-resources-test-secret";
const originals = [];
let baseUrl;
let server;

function token() {
  return jwt.sign({ sub: "ctk-user", roles: ["CUSTOMER"] }, TEST_SECRET, {
    expiresIn: "5m"
  });
}

function installMemoryStore(model, prefix) {
  const records = [];
  const original = {
    create: model.create,
    find: model.find,
    countDocuments: model.countDocuments,
    findById: model.findById,
    findByIdAndUpdate: model.findByIdAndUpdate,
    findByIdAndDelete: model.findByIdAndDelete
  };
  originals.push(() => Object.assign(model, original));

  model.create = async (value) => {
    const record = {
      ...value,
      _id: `${prefix}-${records.length + 1}`,
      createdAt: new Date("2026-10-27T00:00:00.000Z")
    };
    records.push(record);
    return record;
  };
  model.find = (filter) => ({
    skip() {
      return this;
    },
    limit: async () =>
      records.filter((record) =>
        Object.entries(filter).every(([name, value]) =>
          String(record[name]) === String(value)
        )
      )
  });
  model.countDocuments = async (filter) =>
    records.filter((record) =>
      Object.entries(filter).every(([name, value]) =>
        String(record[name]) === String(value)
      )
    ).length;
  model.findById = async (id) =>
    records.find((record) => String(record._id) === String(id)) || null;
  model.findByIdAndUpdate = async (id, update) => {
    const record = records.find((item) => String(item._id) === String(id));
    if (!record) return null;
    Object.assign(record, update);
    return record;
  };
  model.findByIdAndDelete = async (id) => {
    const index = records.findIndex(
      (record) => String(record._id) === String(id)
    );
    return index === -1 ? null : records.splice(index, 1)[0];
  };
}

async function request(path, method = "GET", body) {
  const response = await fetch(new URL(path, baseUrl), {
    method,
    headers: {
      authorization: `Bearer ${token()}`,
      ...(body ? { "content-type": "application/json" } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  return {
    response,
    body: response.status === 204 ? null : await response.json()
  };
}

before(async () => {
  process.env.JWT_ACCESS_SECRET = TEST_SECRET;
  installMemoryStore(ProductOrder, "order");
  installMemoryStore(ShoppingCart, "cart");
  installMemoryStore(ProductOfferingQualification, "qualification");

  const app = require("../src/app");
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  originals.reverse().forEach((restore) => restore());
  await new Promise((resolve, reject) => {
    server.close((cause) => (cause ? reject(cause) : resolve()));
  });
});

test("TMF622 root returns ProductOrder resources", async () => {
  const root = "/tmf-api/productOrderingManagement/v4/productOrder";
  const created = await request(root, "POST", {
    relatedParty: [{ id: "customer-1", "@referredType": "Individual" }],
    productOrderItem: [{ id: "1", action: "add" }]
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.body["@type"], "ProductOrder");
  assert.ok(created.body.id);
  assert.ok(created.body.href);
  assert.ok(created.body.orderDate);

  const listed = await request(root);
  assert.equal(listed.response.status, 200);
  assert.equal(listed.body.length, 1);
  assert.equal(listed.response.headers.get("x-total-count"), "1");

  const patched = await request(
    `${root}/${created.body.id}`,
    "PATCH",
    { state: "inProgress" }
  );
  assert.equal(patched.body.state, "inProgress");
});

test("TMF679 root returns ProductOfferingQualification resources", async () => {
  const root =
    "/tmf-api/productOfferingQualificationManagement/v4/productOfferingQualification";
  const created = await request(root, "POST", {
    productOfferingQualificationItem: [{ id: "1" }]
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.body["@type"], "ProductOfferingQualification");
  assert.ok(created.body.productOfferingQualificationDate);
  assert.equal(created.body.state, "done");

  const retrieved = await request(`${root}/${created.body.id}`);
  assert.equal(retrieved.response.status, 200);
  assert.equal(retrieved.body.id, created.body.id);
});

test("TMF663 root returns ShoppingCart resources", async () => {
  const root = "/tmf-api/shoppingCart/v4/shoppingCart";
  const created = await request(root, "POST", {
    cartItem: [{ id: "1", action: "add" }]
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.body["@type"], "ShoppingCart");
  assert.equal(created.body.status, "active");
  assert.ok(created.body.href);

  const removed = await request(`${root}/${created.body.id}`, "DELETE");
  assert.equal(removed.response.status, 204);
});
