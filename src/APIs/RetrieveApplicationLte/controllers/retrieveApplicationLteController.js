const {
  retrieveApplicationLte
} = require("../services/retrieveApplicationLteService");

async function retrieveLteApplication(req, res, next) {
  try {
    const reference =
      req.params.refNo || req.query.REF_NO || req.query.refNo;
    const responseFormat =
      String(req.headers["x-response-format"] || "tmf").toLowerCase() ===
      "legacy"
        ? "legacy"
        : "tmf";
    const result = await retrieveApplicationLte({
      reference,
      principal: req.user,
      responseFormat
    });

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  retrieveLteApplication
};
