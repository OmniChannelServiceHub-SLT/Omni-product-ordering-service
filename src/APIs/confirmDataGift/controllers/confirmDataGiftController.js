
const service = require("../services/confirmDataGiftService");

async function confirmDataGiftController(req, res) {
    try {
        const result = await service.confirmDataGift(req.body);

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
            message: error.message || "Failed to confirm prepaid data gift enrollment",
            status: String(status),
            "@type": "Error"
        });
    }
}

module.exports = { confirmDataGiftController };
