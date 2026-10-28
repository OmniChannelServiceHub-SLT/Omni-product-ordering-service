const {
  listAccountLink
} = require("../services/listAccountLinkService");

async function listAccountLinks(req, res, next) {
  try {
    const responseFormat =
      String(req.headers["x-response-format"] || "tmf").toLowerCase() ===
      "legacy"
        ? "legacy"
        : "tmf";

    const result = await listAccountLink({
      telephoneNo: req.query.telephoneNo,
      principal: req.user,
      responseFormat
    });

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listAccountLinks
};
