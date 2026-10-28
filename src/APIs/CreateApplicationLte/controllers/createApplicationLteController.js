const {
  createApplicationLte
} = require("../services/createApplicationLteService");

async function createLteApplication(req, res, next) {
  try {
    const responseFormat =
      String(req.headers["x-response-format"] || "tmf").toLowerCase() ===
      "legacy"
        ? "legacy"
        : "tmf";

    const result = await createApplicationLte({
      data: req.body,
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
  createLteApplication
};
