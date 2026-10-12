const validateDataTransferSubService = require(
  "../services/validateDataTransferSubService"
);

async function validateDataTransfer(req, res, next) {
  try {
    const payload = {
      ...(req.body || {}),
      ...(req.query || {})
    };

    const responseFormat =
      String(
        req.headers["x-response-format"] || "tmf"
      ).toLowerCase() === "legacy"
        ? "legacy"
        : "tmf";

    const result =
      await validateDataTransferSubService.validateDataTransfer(
        payload,
        responseFormat
      );

    if (!result || typeof result !== "object") {
      const error = new Error(
        "Data transfer subscriber validation service returned an invalid response"
      );
      error.statusCode = 500;
      return next(error);
    }

    const statusCode = Number(result.statusCode) || 200;
    const body =
      result.body !== undefined
        ? result.body
        : result;

    return res.status(statusCode).json(body);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  validateDataTransfer
};
