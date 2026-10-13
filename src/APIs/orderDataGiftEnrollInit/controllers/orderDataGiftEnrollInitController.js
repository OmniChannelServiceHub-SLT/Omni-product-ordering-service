
const service = require("../services/orderDataGiftEnrollInitService");

async function orderDataGiftEnrollInitController(req, res) {
    try {
        const result = await service.orderDataGiftEnrollInit(req.query);

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
            message: error.message || "Failed to initialize prepaid data gift enrollment",
            status: String(status),
            "@type": "Error"
        });
    }
}

module.exports = { orderDataGiftEnrollInitController };
