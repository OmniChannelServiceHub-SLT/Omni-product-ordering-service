
const service = require("../services/validateDataGiftService");

async function validateDataGiftController(req, res) {
    try {
        const result = await service.validateDataGift(req.query);

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
            message: error.message || "Failed to validate data gift subscription",
            status: String(status),
            "@type": "Error"
        });
    }
}

module.exports = { validateDataGiftController };
