const packageActivationService =
  require("../services/packageActivationService");

async function createPackageActivation(req, res, next) {
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
      await packageActivationService.createPackageActivation(
        payload,
        responseFormat
      );

    if (!result || typeof result !== "object") {
      const error = new Error(
        "Package activation service returned an invalid response"
      );

      error.statusCode = 500;
      return next(error);
    }

    const statusCode =
      Number(result.statusCode) || 200;

    const body =
      result.body !== undefined
        ? result.body
        : result;

    if (
      statusCode === 201 &&
      typeof body.href === "string" &&
      body.href.trim() !== ""
    ) {
      res.location(body.href);
    }

    return res
      .status(statusCode)
      .json(body);

  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPackageActivation
};