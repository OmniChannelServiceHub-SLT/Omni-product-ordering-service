const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

const jwt = require("jsonwebtoken");
const ProductOfferingQualification = require(
  "../src/models/TMF679_ProductOfferingQualification"
);

const TEST_SECRET = "create-offering-test-secret";
const TMF_PATH =
  "/tmf-api/productOfferingQualification/v4/productOfferingQualification/offering";
const LEGACY_PATH =
  "/tmf-api/productOfferingQualification/v1/productOfferingQualification/offering";

let baseUrl;
let originalCreate;
let savedQualifications;
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

async function requestOffering({
  method = "POST",
  path = TMF_PATH,
  telephoneNo,
  token,
  channel = "OMNI"
} = {}) {
  const url = new URL(path, baseUrl);
  const headers = {};
  const request = {
    method,
    headers
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  if (method === "GET") {
    if (telephoneNo !== undefined) {
      url.searchParams.set("telephoneno", telephoneNo);
    }
  } else {
    headers["content-type"] = "application/json";
    request.body = JSON.stringify({
      ...(telephoneNo === undefined ? {} : { telephoneno: telephoneNo }),
      channel
    });
  }

  const response = await fetch(url, request);

  return {
    response,
    body: await response.json()
  };
}

before(async () => {
  process.env.JWT_ACCESS_SECRET = TEST_SECRET;
  savedQualifications = [];
  originalCreate = ProductOfferingQualification.create;
  ProductOfferingQualification.create = async (qualification) => {
    const saved = {
      ...qualification,
      _id: `qualification-${savedQualifications.length + 1}`,
      createdAt: new Date().toISOString()
    };
    savedQualifications.push(saved);
    return saved;
  };

  const app = require("../src/app");

  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  ProductOfferingQualification.create = originalCreate;

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("creates a persisted TMF679 offering qualification", async () => {
  const { response, body } = await requestOffering({
    telephoneNo: "0112488102",
    token: tokenFor("0112488102"),
    channel: "MYSLT"
  });

  assert.equal(response.status, 201);
  assert.equal(body["@type"], "ProductOfferingQualification");
  assert.equal(body.state, "done");
  assert.equal(body.relatedParty[0].id, "0112488102");
  assert.equal(body.channel[0].id, "MYSLT");
  assert.equal(body.productOfferingQualificationItem.length, 2);
  assert.equal(
    body.productOfferingQualificationItem[0].productOffering.id,
    "1"
  );
  assert.equal(response.headers.get("location"), body.href);
  assert.equal(savedQualifications.length, 1);
});

test("returns the workbook legacy availability response", async () => {
  const { response, body } = await requestOffering({
    method: "GET",
    path: LEGACY_PATH,
    telephoneNo: "0112488102",
    token: tokenFor("0112488102")
  });

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: [
      {
        telephoneno: "0112488102",
        eligibledate: "6/15/2023 3:27:10 PM",
        expiredate: "7/15/2023 3:27:10 PM",
        packageid: "1",
        refno: ""
      },
      {
        telephoneno: "0112488102",
        eligibledate: "6/21/2023 3:45:46 PM",
        expiredate: "7/21/2023 3:45:46 PM",
        packageid: "1",
        refno: "28848"
      }
    ],
    errorShow: null,
    errorCode: null
  });
});

test("creates a completed qualification when no offers are available", async () => {
  const { response, body } = await requestOffering({
    telephoneNo: "0771234567",
    token: tokenFor("0771234567")
  });

  assert.equal(response.status, 201);
  assert.equal(body.state, "done");
  assert.deepEqual(body.productOfferingQualificationItem, []);
});

test("rejects access to another subscriber's offerings", async () => {
  const { response, body } = await requestOffering({
    telephoneNo: "0112488102",
    token: tokenFor("0771234567")
  });

  assert.equal(response.status, 403);
  assert.equal(body.reason, "Forbidden");
});

test("requires telephoneno", async () => {
  const { response, body } = await requestOffering({
    token: tokenFor("0112488102")
  });

  assert.equal(response.status, 400);
  assert.match(body.message, /telephoneno/);
});

test("validates telephoneno", async () => {
  const { response, body } = await requestOffering({
    telephoneNo: "invalid-number",
    token: tokenFor("invalid-number")
  });

  assert.equal(response.status, 400);
  assert.match(body.message, /7 to 15 digits/);
});
