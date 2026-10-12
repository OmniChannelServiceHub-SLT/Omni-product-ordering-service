const addVASDataBundlePrepaidConfirmService = require(
  "../services/addVASDataBundlePrepaidConfirmService"
);

async function confirmAddVasBundle(req, res, next) {
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
      await addVASDataBundlePrepaidConfirmService.confirmAddVasBundle(
        payload,
        responseFormat
      );

    if (!result || typeof result !== "object") {
      const error = new Error(
        "Prepaid VAS data bundle confirmation service returned an invalid response"
      );
      error.statusCode = 500;
      return next(error);
    }

    const statusCode = Number(result.statusCode) || 202;
    const body =
      result.body !== undefined
        ? result.body
        : result;

    if (
      [200, 202].includes(statusCode) &&
      typeof body.href === "string" &&
      body.href.trim() !== ""
    ) {
      res.location(body.href);
    }

    return res.status(statusCode).json(body);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  confirmAddVasBundle
};
