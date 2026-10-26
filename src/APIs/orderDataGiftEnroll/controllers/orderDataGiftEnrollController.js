const service = require("../services/orderDataGiftEnrollService");

async function orderDataGiftEnrollController(req, res) {
    try {
        // Accept inputs from the query string (as in the Excel) or the JSON body
        const input = {
            ...(req.query || {}),
            ...(req.body || {})
        };

        const result = await service.orderDataGiftEnroll(input);

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
            message: error.message || "Failed to enroll in data gifting",
            status: String(status),
            "@type": "Error"
        });
    }
}

module.exports = { orderDataGiftEnrollController };