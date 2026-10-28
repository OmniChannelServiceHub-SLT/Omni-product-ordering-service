const {
  patchApplicationLte
} = require("../services/patchApplicationLteService");

async function patchLteApplication(req, res, next) {
  try {
    const reference =
      req.params.refNo ||
      req.query.REF_NO ||
      req.query.refNo ||
      req.body?.REF_NO ||
      req.body?.refNo;
    const responseFormat =
      req.method === "POST" ||
      String(req.headers["x-response-format"] || "").toLowerCase() ===
        "legacy"
        ? "legacy"
        : "tmf";
    const data = {
      ...(req.query || {}),
      ...(req.body || {})
    };

    delete data.REF_NO;
    delete data.refNo;

    const result = await patchApplicationLte({
      reference,
      data,
      principal: req.user,
      responseFormat
    });

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  patchLteApplication
};
