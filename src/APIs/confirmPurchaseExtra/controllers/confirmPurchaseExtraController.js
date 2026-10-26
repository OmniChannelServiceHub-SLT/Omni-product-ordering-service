const service = require("../services/confirmPurchaseExtraService");

async function confirmPurchaseExtraController(req, res) {
    try {
        // Accept inputs from the query string (as in the Excel) or the JSON body
        const input = {
            ...(req.query || {}),
            ...(req.body || {})
        };

        const result = await service.confirmPurchaseExtra(input);

        return res.status(200).json(result);
    } catch (error) {
        const status = error.status || 500;

        return res.status(status).json({
            code: String(status),
            reason:
                status === 400
                    ? "Bad Request"
                    : "Internal Server Error",
            message: error.message || "Failed to confirm prepaid extra GB purchase",
            status: String(status),
            "@type": "Error"
        });
    }
}

module.exports = { confirmPurchaseExtraController };