const {
  orderPackage
} = require("../services/orderPackageService");

async function createPackageOrder(req, res, next) {
  try {
    const data = {
      ...(req.query || {}),
      ...(req.body || {})
    };
    const responseFormat =
      String(req.headers["x-response-format"] || "tmf").toLowerCase() ===
      "legacy"
        ? "legacy"
        : "tmf";
    const result = await orderPackage({
      data,
      principal: req.user,
      responseFormat
    });

    if (result.statusCode === 201 && result.body.href) {
      res.location(result.body.href);
    }

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPackageOrder
};
