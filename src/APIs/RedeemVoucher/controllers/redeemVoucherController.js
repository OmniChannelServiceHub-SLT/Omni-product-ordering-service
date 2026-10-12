const redeemVoucherService = require(
  "../services/redeemVoucherService"
);

async function redeemVoucher(req, res, next) {
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
      await redeemVoucherService.redeemVoucher(
        payload,
        responseFormat
      );

    if (!result || typeof result !== "object") {
      const error = new Error(
        "Redeem voucher service returned an invalid response"
      );
      error.statusCode = 500;
      return next(error);
    }

    const statusCode = Number(result.statusCode) || 201;
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

    return res.status(statusCode).json(body);
  } catch (error) {
    return next(error);
  }
}

async function createTmfProductOrder(req, res, next) {
  try {
    const result =
      await redeemVoucherService.createTmfProductOrder(req.body);
    const body = result.body;

    res.location(body.href);
    return res.status(result.statusCode).json(body);
  } catch (error) {
    return next(error);
  }
}

async function listTmfProductOrders(req, res, next) {
  try {
    const result =
      await redeemVoucherService.listTmfProductOrders(req.query);

    res.set("X-Result-Count", String(result.body.length));
    res.set("X-Total-Count", String(result.totalCount));
    return res.status(200).json(result.body);
  } catch (error) {
    return next(error);
  }
}

async function retrieveTmfProductOrder(req, res, next) {
  try {
    const body =
      await redeemVoucherService.retrieveTmfProductOrder(
        req.params.id,
        req.query.fields
      );

    return res.status(200).json(body);
  } catch (error) {
    return next(error);
  }
}

async function updateTmfProductOrder(req, res, next) {
  try {
    const body = await redeemVoucherService.updateTmfProductOrder(
      req.params.id,
      req.body
    );

    return res.status(200).json(body);
  } catch (error) {
    return next(error);
  }
}

async function deleteTmfProductOrder(req, res, next) {
  try {
    await redeemVoucherService.deleteTmfProductOrder(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  redeemVoucher,
  createTmfProductOrder,
  listTmfProductOrders,
  retrieveTmfProductOrder,
  updateTmfProductOrder,
  deleteTmfProductOrder
};
