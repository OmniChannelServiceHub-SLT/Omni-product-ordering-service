const {
  createOffering
} = require("../services/createOfferingService");

async function createOfferingQualification(req, res, next) {
  try {
    const responseFormat =
      req.method === "GET" ||
      String(req.headers["x-response-format"] || "").toLowerCase() ===
        "legacy"
        ? "legacy"
        : "tmf";
    const data = {
      ...(req.query || {}),
      ...(req.body || {})
    };
    const result = await createOffering({
      data,
      principal: req.user,
      responseFormat
    });

    if (
      result.statusCode === 201 &&
      typeof result.body.href === "string"
    ) {
      res.location(result.body.href);
    }

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOfferingQualification
};
