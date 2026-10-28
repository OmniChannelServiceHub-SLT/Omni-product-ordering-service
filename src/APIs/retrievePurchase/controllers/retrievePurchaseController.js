const service = require("../services/retrievePurchaseService");

async function retrievePurchaseController(req, res) {
    try {
        const result = await service.retrievePurchase(req.query);

        return res.status(200).json(result);
    } catch (error) {
        const status = error.status || 500;

        return res.status(status).json({
            code: String(status),
            reason:
                status === 400
                    ? "Bad Request"
                    : "Internal Server Error",
            message: error.message || "Failed to validate broadband purchase request",
            status: String(status),
            "@type": "Error"
        });
    }
}

module.exports = { retrievePurchaseController };