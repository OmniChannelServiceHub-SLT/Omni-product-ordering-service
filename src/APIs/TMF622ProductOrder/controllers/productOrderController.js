const ProductOrder = require("../../../models/TMF622_ProductOrder");

function error(statusCode, message) {
  const value = new Error(message);
  value.statusCode = statusCode;
  return value;
}

function asObject(document) {
  return typeof document?.toObject === "function"
    ? document.toObject({ versionKey: false })
    : { ...document };
}

function resource(document, req) {
  const value = asObject(document);
  const id = String(value.id || value._id);

  delete value._id;
  delete value.__v;
  delete value.legacyPayload;
  delete value.legacyOperation;
  delete value.createdAt;
  delete value.updatedAt;

  return {
    ...value,
    id,
    href:
      value.href ||
      `${req.protocol}://${req.get("host")}${req.baseUrl}/${id}`,
    orderDate:
      value.orderDate ||
      document?.createdAt?.toISOString?.() ||
      document?.createdAt ||
      new Date().toISOString(),
    state: value.state || "acknowledged",
    relatedParty: value.relatedParty || [],
    productOrderItem: value.productOrderItem || [],
    "@type": value["@type"] || "ProductOrder"
  };
}

function selectFields(value, fields) {
  if (!fields) return value;

  const selected = {};
  fields
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean)
    .forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(value, field)) {
        selected[field] = value[field];
      }
    });
  return selected;
}

async function createProductOrder(req, res, next) {
  try {
    if (!Array.isArray(req.body.productOrderItem)) {
      throw error(400, "productOrderItem must be an array");
    }

    const saved = await ProductOrder.create({
      ...req.body,
      orderDate: req.body.orderDate || new Date().toISOString(),
      state: req.body.state || "acknowledged",
      "@type": req.body["@type"] || "ProductOrder"
    });
    const body = resource(saved, req);

    res.location(body.href);
    return res.status(201).json(body);
  } catch (cause) {
    return next(cause);
  }
}

async function listProductOrders(req, res, next) {
  try {
    const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 100, 1),
      1000
    );
    const filter = {};

    ["id", "state", "externalId"].forEach((name) => {
      if (req.query[name] !== undefined) {
        filter[name === "id" ? "_id" : name] = req.query[name];
      }
    });

    const [documents, total] = await Promise.all([
      ProductOrder.find(filter).skip(offset).limit(limit),
      ProductOrder.countDocuments(filter)
    ]);
    const body = documents.map((document) =>
      selectFields(resource(document, req), req.query.fields)
    );

    res.set("X-Total-Count", String(total));
    res.set("X-Result-Count", String(body.length));
    return res.status(200).json(body);
  } catch (cause) {
    return next(cause);
  }
}

async function retrieveProductOrder(req, res, next) {
  try {
    const document = await ProductOrder.findById(req.params.id);
    if (!document) throw error(404, "ProductOrder was not found");
    return res
      .status(200)
      .json(selectFields(resource(document, req), req.query.fields));
  } catch (cause) {
    if (cause?.name === "CastError") {
      return next(error(404, "ProductOrder was not found"));
    }
    return next(cause);
  }
}

async function patchProductOrder(req, res, next) {
  try {
    const update = { ...req.body };
    delete update.id;
    delete update.href;
    delete update._id;

    const document = await ProductOrder.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!document) throw error(404, "ProductOrder was not found");
    return res.status(200).json(resource(document, req));
  } catch (cause) {
    if (cause?.name === "CastError") {
      return next(error(404, "ProductOrder was not found"));
    }
    return next(cause);
  }
}

async function deleteProductOrder(req, res, next) {
  try {
    const document = await ProductOrder.findByIdAndDelete(req.params.id);
    if (!document) throw error(404, "ProductOrder was not found");
    return res.status(204).send();
  } catch (cause) {
    if (cause?.name === "CastError") {
      return next(error(404, "ProductOrder was not found"));
    }
    return next(cause);
  }
}

module.exports = {
  createProductOrder,
  listProductOrders,
  retrieveProductOrder,
  patchProductOrder,
  deleteProductOrder
};
