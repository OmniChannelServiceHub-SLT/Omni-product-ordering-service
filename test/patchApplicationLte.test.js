const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

const jwt = require("jsonwebtoken");
const ShoppingCart = require("../src/models/TMF663_ShoppingCart");

const TEST_SECRET = "patch-application-lte-test-secret";
const BASE_PATH =
  "/tmf-api/shoppingCart/v4/shoppingCart/application-lte";
const LEGACY_PATH =
  "/tmf-api/shoppingCart/v1/shoppingCart/application-lte/patch";

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

function createDraft(refNo = "LTE_2948", owner = "applicant-user-id") {
  return {
    id: refNo,
    href: `/tmf-api/shoppingCart/v4/shoppingCart/${refNo}`,
    status: "active",
    relatedParty: [
      {
        id: owner,
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
            },
            {
              name: "lastName",
              value: "Kumara",
              "@type": "StringCharacteristic"
            },
            {
              name: "passportNumber",
              value: "OLD-PASSPORT",
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
      FIRSTNAME: "Randika",
      LASTNAME: "Kumara",
      PP: "OLD-PASSPORT",
      SERVICE_TYPE: "LTE"
    },
    modifiedPaths: [],
    markModified(path) {
      this.modifiedPaths.push(path);
    },
    async save() {
      this.saved = true;
      return this;
    }
  };
}

async function patchApplication({
  path = BASE_PATH,
  refNo,
  body,
  method = "PATCH",
  token = tokenFor()
}) {
  const url = new URL(path, baseUrl);

  if (refNo !== undefined) {
    url.searchParams.set("REF_NO", refNo);
  }

  const headers = {
    "content-type":
      method === "PATCH"
        ? "application/merge-patch+json"
        : "application/json"
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
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
  originalFindOne = ShoppingCart.findOne;
  ShoppingCart.findOne = async (query) =>
    drafts.get(query["legacyPayload.REF_NO"]) || null;

  const app = require("../src/app");

  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => {
  drafts = new Map([["LTE_2948", createDraft()]]);
});

after(async () => {
  ShoppingCart.findOne = originalFindOne;

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("patches the authorized LTE draft", async () => {
  const { response, body } = await patchApplication({
    refNo: "LTE_2948",
    body: {
      FIRSTNAME: "Randikaaaaaa",
      PP: ""
    }
  });
  const saved = drafts.get("LTE_2948");
  const characteristics =
    saved.cartItem[0].product.productCharacteristic;

  assert.equal(response.status, 200);
  assert.equal(body.id, "LTE_2948");
  assert.equal(body["@type"], "ShoppingCart");
  assert.equal(saved.legacyPayload.FIRSTNAME, "Randikaaaaaa");
  assert.equal(saved.legacyPayload.LASTNAME, "Kumara");
  assert.equal(saved.legacyPayload.PP, "");
  assert.equal(
    characteristics.find((item) => item.name === "firstName").value,
    "Randikaaaaaa"
  );
  assert.equal(
    characteristics.some((item) => item.name === "passportNumber"),
    false
  );
  assert.equal(saved.saved, true);
});

test("supports the workbook legacy POST contract", async () => {
  const { response, body } = await patchApplication({
    path: LEGACY_PATH,
    refNo: "LTE_2948",
    method: "POST",
    body: {
      NIC: "222222222V"
    }
  });

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {},
    errorShow: null,
    errorCode: null
  });
  assert.equal(drafts.get("LTE_2948").legacyPayload.NIC, "222222222V");
});

test("returns 404 for an unknown LTE reference", async () => {
  const { response, body } = await patchApplication({
    refNo: "LTE_9999",
    body: { FIRSTNAME: "Updated" }
  });

  assert.equal(response.status, 404);
  assert.match(body.message, /LTE_9999/);
});

test("rejects a principal that does not own the draft", async () => {
  const { response, body } = await patchApplication({
    refNo: "LTE_2948",
    body: { FIRSTNAME: "Updated" },
    token: tokenFor("different-user")
  });

  assert.equal(response.status, 403);
  assert.equal(body.reason, "Forbidden");
  assert.equal(drafts.get("LTE_2948").legacyPayload.FIRSTNAME, "Randika");
});

test("requires REF_NO", async () => {
  const { response, body } = await patchApplication({
    body: { FIRSTNAME: "Updated" }
  });

  assert.equal(response.status, 400);
  assert.match(body.message, /REF_NO/);
});

test("validates supplied patch fields", async () => {
  const { response, body } = await patchApplication({
    refNo: "LTE_2948",
    body: { LATITUDE: "120" }
  });

  assert.equal(response.status, 400);
  assert.match(body.message, /LATITUDE/);
});
