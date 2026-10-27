const ProductOfferingQualification = require(
  "../../../models/TMF679_ProductOfferingQualification"
);

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
    productOfferingQualificationDate:
      value.productOfferingQualificationDate ||
      document?.createdAt?.toISOString?.() ||
      document?.createdAt ||
      new Date().toISOString(),
    state: value.state || "done",
    productOfferingQualificationItem:
      value.productOfferingQualificationItem || [],
    "@type":
      value["@type"] || "ProductOfferingQualification"
  };
}

function selectFields(value, fields) {
  if (!fields) return value;
  return fields
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean)
    .reduce((selected, field) => {
      if (Object.prototype.hasOwnProperty.call(value, field)) {
        selected[field] = value[field];
      }
      return selected;
    }, {});
}

function containsUnsupportedParameter(value) {
  if (Array.isArray(value)) {
    return value.some(containsUnsupportedParameter);
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  if (Object.prototype.hasOwnProperty.call(value, "isRef")) {
    return true;
  }

  return Object.values(value).some(containsUnsupportedParameter);
}

async function createQualification(req, res, next) {
  try {
    if (!Array.isArray(req.body.productOfferingQualificationItem)) {
      throw error(
        400,
        "productOfferingQualificationItem must be an array"
      );
    }

    if (containsUnsupportedParameter(req.body)) {
      throw error(400, "Unexpected parameter: isRef");
    }

    const saved = await ProductOfferingQualification.create({
      ...req.body,
      productOfferingQualificationDate:
        req.body.productOfferingQualificationDate || new Date().toISOString(),
      state: req.body.state || "done",
      "@type":
        req.body["@type"] || "ProductOfferingQualification"
    });
    const body = resource(saved, req);

    res.location(body.href);
    return res.status(201).json(body);
  } catch (cause) {
    return next(cause);
  }
}

async function listQualifications(req, res, next) {
  try {
    const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 100, 1),
      1000
    );
    const filter = {};
    if (req.query.id !== undefined) filter._id = req.query.id;
    if (req.query.state !== undefined) filter.state = req.query.state;

    const [documents, total] = await Promise.all([
      ProductOfferingQualification.find(filter).skip(offset).limit(limit),
      ProductOfferingQualification.countDocuments(filter)
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

async function retrieveQualification(req, res, next) {
  try {
    const document = await ProductOfferingQualification.findById(req.params.id);
    if (!document) {
      throw error(404, "ProductOfferingQualification was not found");
    }
    return res
      .status(200)
      .json(selectFields(resource(document, req), req.query.fields));
  } catch (cause) {
    if (cause?.name === "CastError") {
      return next(error(404, "ProductOfferingQualification was not found"));
    }
    return next(cause);
  }
}

async function patchQualification(req, res, next) {
  try {
    const update = { ...req.body };
    delete update.id;
    delete update.href;
    delete update._id;

    const document = await ProductOfferingQualification.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!document) {
      throw error(404, "ProductOfferingQualification was not found");
    }
    return res.status(200).json(resource(document, req));
  } catch (cause) {
    if (cause?.name === "CastError") {
      return next(error(404, "ProductOfferingQualification was not found"));
    }
    return next(cause);
  }
}

async function deleteQualification(req, res, next) {
  try {
    const document = await ProductOfferingQualification.findByIdAndDelete(
      req.params.id
    );
    if (!document) {
      throw error(404, "ProductOfferingQualification was not found");
    }
    return res.status(204).send();
  } catch (cause) {
    if (cause?.name === "CastError") {
      return next(error(404, "ProductOfferingQualification was not found"));
    }
    return next(cause);
  }
}

module.exports = {
  createQualification,
  listQualifications,
  retrieveQualification,
  patchQualification,
  deleteQualification
};
