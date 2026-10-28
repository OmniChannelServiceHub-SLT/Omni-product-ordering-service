const service = require("../services/orderPurchasedService");

async function orderPurchasedController(req, res) {
    try {
        // Accept inputs from the query string (as in the Excel) or the JSON body
        const input = {
            ...(req.query || {}),
            ...(req.body || {})
        };

        const result = await service.orderPurchased(input);

        return res.status(201).json(result);
    } catch (error) {
        const status = error.status || 500;

        return res.status(status).json({
            code: String(status),
            reason:
                status === 400
                    ? "Bad Request"
                    : "Internal Server Error",
            message: error.message || "Failed to purchase product",
            status: String(status),
            "@type": "Error"
        });
    }
}

module.exports = { orderPurchasedController };