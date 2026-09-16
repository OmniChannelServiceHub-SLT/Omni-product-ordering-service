const { createAdvancedReportsPostPaid } = require("../services/createAdvancedReportsPostPaidService");

async function handle(req, res, next) {
  try {
    const result = await createAdvancedReportsPostPaid(req.query, req.body, req.headers.authorization);
    const legacy = String(req.headers["x-response-format"] || "tmf").toLowerCase() === "legacy";
    if (legacy) return res.status(200).json(result.backend);
    if ("createAdvancedReportsPostPaid".startsWith("list")) return res.status(200).json(result.response);
    return res.status(201).location(result.response.href).json(result.response);
  } catch (error) {
    return next(error);
  }
}

module.exports = { handle };
