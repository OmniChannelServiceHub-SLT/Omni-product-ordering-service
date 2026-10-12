
const service = require("../services/orderPurchaseExtraGbInitService");

async function orderPurchaseExtraGbInitController(req, res) {
    try {
        const input = {
            subscriberID: req.body?.subscriberID,
            packageId: req.body?.packageId,
            commitUser: req.body?.commitUser,
            channel: req.body?.channel
        };

        const result = await service.orderPurchaseExtraGbInit(input);

        return res.status(200).json(result);
    } catch (error) {
        const status = error.status || 500;

        return res.status(status).json({
            code: String(status),
            reason:
                status === 400
                    ? "Bad Request"
                    : status === 501
                        ? "Not Implemented"
                        : "Internal Server Error",
            message: error.message || "Failed to initialize prepaid extra GB purchase",
            status: String(status),
            "@type": "Error"
        });
    }
}

module.exports = { orderPurchaseExtraGbInitController };
